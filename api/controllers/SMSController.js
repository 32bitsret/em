"use strict";
/**
 * ElectionResultController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const _ = require('lodash');
const sendSMS = require("../lib/sendSMS");
const AppConfig = require("../lib/AppConfig");

let controlLevel = AppConfig.controlLevel;

module.exports = {

    subscribeToDataChanges: function(req, res) {
        if (!req.isSocket) {
            return res.badRequest('Only a client socket can subscribe to reload.  But you look like an HTTP request to me.');
        }
        var socket = sails.sockets.parseSocket(req);
        sails.sockets.join(socket, 'reload');
        console.log('Subscribed socket', sails.sockets.getId(socket), 'to', 'reload');
        return res.ok();
    },
  
    callbackV2: async(req, res) => {
        let pollingUnit = req.pollingUnit;
        let body = req.smsBody;
        if(body.command === 'result'){
          let data = [];
            
          if(controlLevel === 'WARD'){
              console.log({controlLevel});
            var warderPhone = pollingUnit.phone;
            console.log({"chck": body.pu});
            try{
                pollingUnit = await sails.models.pollingunit.findOne({
                    pollingUnit: body.pu || "Unknown PU",
                    phone: warderPhone,
                });
            }catch(err){
                try{
                    let qsms = await sendSMS(warderPhone, "Polling unit not found or not assigned to your phone. \nAcceptable format is: 1,PARTY-VOTE,PARTY-VOTE" + (AppConfig.controlLevel === 'WARD' ? ", PU" : ""));
                    await sails.models.smserror.create({
                        sms: body.raw,
                        phone: warderPhone,
                        state: req.pollingUnit.state,
                        senatorialZone: req.pollingUnit.senatorialZone,
                        localGovernment: req.pollingUnit.localGovernment,
                        ward: req.pollingUnit.ward,
                        phoneUserName: req.pollingUnit.phoneUserName
                    });
                    sails.sockets.broadcast('reload', {type: 'smserrors'});
                    console.log({qsms})
                }catch(iErr){
                    console.log({iErr});
                }
                // res.badRequest();
                return;
            }
            if (!pollingUnit) {
                try{
                    let sms = await sendSMS(warderPhone, "Polling unit not found or not assigned to your phone. \nAcceptable format is: 1,PARTY-VOTE,PARTY-VOTE" + (AppConfig.controlLevel === 'WARD' ? ", PU" : ""));
                    await sails.models.smserror.create({
                        sms: body.raw,
                        phone: warderPhone,
                        state: req.pollingUnit.state,
                        senatorialZone: req.pollingUnit.senatorialZone,
                        localGovernment: req.pollingUnit.localGovernment,
                        ward: req.pollingUnit.ward,
                        phoneUserName: req.pollingUnit.phoneUserName
                    });
                    sails.sockets.broadcast('reload', {type: 'smserrors'});
                    console.log({sms})
                }catch(iErr){
                    console.log({iErr});
                }
                // res.badRequest("Polling unit not found");
                return;
            }
            pollingUnit = _.omit(pollingUnit, ['id', 'createdAt', 'updatedAt', 'accountEnabled']);
            for(let i = 0; i < body.results.length; i++){
                data.push(Object.assign({}, pollingUnit, {
                    party: body.results[i].party,
                    vote: parseInt(body.results[i].vote),
                    raw: body.raw,
                }));
            }
          }else{
            console.log("by pass");
            for(let i = 0; i < body.results.length; i++){
                data.push(Object.assign({}, pollingUnit, {
                    party: body.results[i].party,
                    vote: parseInt(body.results[i].vote),
                    raw: body.raw,
                }));
            }
          }
          
            let results = [], errorCount = 0, updateCount = 0, insertCount = 0, errorMessage = [];
            for(let i = 0; i < data.length; i++){
                console.log({query:  _.omit(data[i], ['vote', 'raw']), insertIf: data[i]});
                try{
                    let updated = false;
                    if(AppConfig.strictParty && AppConfig.parties.indexOf(data[i].party) < 0){
                        throw new Error(`stictParty is set, ${data[i].party} is not allowed in parties config`);
                    }
                    if(body.resultType == 1){
                        var created = await sails.models.electionresult.findOne(_.omit(data[i], ['vote', 'raw']));
                    }else{
                        created = await sails.models.electionsenateresult.findOne(_.omit(data[i], ['vote', 'raw']));
                    }
                    if(!created){
                        if(body.resultType == 1){
                            created = await sails.models.electionresult.create(data[i]).fetch();
                        }else{
                            created = await sails.models.electionsenateresult.create(data[i]).fetch();
                        }
                        try{
                            sails.sockets.broadcast('reload', {type: 'electionresult'});
                            sails.sockets.broadcast('reload', {type: 'electionsenateresult'});
                        }catch(err){
                            console.log({errorCatcher: err});
                        }
                        insertCount++;
                    }else{
                        //UPDATE THE LAST VOTE - One Agent Per Polling Unit Per Vote Per Party
                        if(body.resultType == 1){
                            if(body.adminUpdate){
                                updated = await sails.models.electionresult.update(created).set(Object.assign({}, created, {vote: data[i].vote, oldVote: created.vote, adminPhone: body.adminPhone, updatedAt: Date.now(), raw: data[i].raw})).fetch();
                            }else{
                                updated = await sails.models.electionresult.update(created).set(Object.assign({}, created, {/*vote: data[i].vote, */changeVote: data[i].vote, updatedAt: Date.now(), raw: data[i].raw})).fetch();
                            }
                        }else{
                            if(body.adminUpdate){
                                updated = await sails.models.electionsenateresult.update(created).set(Object.assign({}, created, {vote: data[i].vote, oldVote: created.vote, adminPhone: body.adminPhone, updatedAt: Date.now(), raw: data[i].raw})).fetch();
                            }else{
                                updated = await sails.models.electionsenateresult.update(created).set(Object.assign({}, created, {/*vote: data[i].vote, */changeVote: data[i].vote, updatedAt: Date.now(), raw: data[i].raw})).fetch();
                            }
                        }
                        console.log({updated});
                        try{
                            sails.sockets.broadcast('reload', {type: 'electionresult'});
                            sails.sockets.broadcast('reload', {type: 'electionsenateresult'});
                        }catch(err){
                            console.log({errorCatcher: err});
                        }
                        updateCount++;
                    }
                }catch(err){
                    results[i] = false;
                    errorMessage.push(err.message);
                    errorCount++;
                }
            }

            try{
                var textMessage = "";
                if(body.adminUpdate){
                    if(updateCount){
                        textMessage += `${updateCount} records have been updated. `
                    }
                    if(insertCount){
                        textMessage += `${insertCount} records have been inserted. `
                    }
                    if(errorCount){
                        textMessage += `${errorCount} errors occured`;
                    }
                    textMessage += " Thank you."
                    let qsms = await sendSMS(body.adminPhone, textMessage);
                    if(!insertCount){
                        var vsms = await sendSMS(warderPhone, 'Your previous update has been accepted by the admin.');
                    }
                    console.log({qsms, vsms})
                }else{
                    if(updateCount){
                        textMessage += `${updateCount} records have been submitted for review. `
                    }
                    if(insertCount){
                        textMessage += `${insertCount} records have been inserted. `
                    }
                    if(errorCount){
                        textMessage += `${errorCount} errors occured `;
                    }
                    textMessage += "Thank you. ;-)"
                    let sms = await sendSMS(warderPhone, textMessage);
                    console.log({sms})
                }
            }catch(iErr){
                console.log({iErr});
            }
            console.log({errorMessage, insertCount, updateCount, errorCount})
            // res.ok();
            return;
           
        }else if(body.command === 'incidence'){
            let data = {
                text: body.text,
                raw: body.raw,
            };

          if(controlLevel === 'WARD'){
            let warderPhone = pollingUnit.phone;
            pollingUnit = await sails.models.pollingunit.findOne({
                pollingUnit: body.pu || 'Unknown PU',
                phone: warderPhone
            });
            if (!pollingUnit) {
                try{
                    let sms = await sendSMS(warderPhone, "Polling unit not found or assigned to your phone. Acceptable format: "+ (AppConfig.controlLevel === 'WARD' ?  "2,CODE:PU,Your Comment" : "2,CODE,Your Comment"));
                    console.log({sms})
                }catch(iErr){
                    console.log({iErr});
                }
                // res.badRequest();
                return;
            }
            pollingUnit = _.omit(pollingUnit, ['id', 'createdAt', 'updatedAt', 'accountEnabled']);
            data = Object.assign({}, req.incidence, pollingUnit, data);
          }else{
            data = Object.assign({}, req.incidence, pollingUnit, data);
          }

          console.log({data});
          try{
                let created = await sails.models.incidencereport.create(data).fetch();
                try{
                    // sails.models.incidencereport.publish(created);
                    sails.sockets.broadcast('reload', {type: 'incidencereport'});
                }catch(err){
                    console.log({errorCatcher: err});
                };
                if(created && created.id){
                    //Send SMS
                    try{
                        let sms = await sendSMS(warderPhone, "Your Incidence report have been submitted. Thank you. ;-)");
                        console.log({sms});
                    }catch(iErr){
                        console.log({iErr});
                    }
                    // res.ok(created);
                    return;
                }else{
                    console.log({created});
                    // res.badRequest("Unable to insert record");
                    return;
                }
            }catch(err){
                console.log({err});
                try{
                    let sms = await sendSMS(warderPhone, "An internal server error occured");
                    console.log({sms});
                }catch(iErr){
                    console.log({iErr});
                }
                // res.badRequest(err);
                return;
            }
        }else{
            try{
                let sms = await sendSMS(data.phone, "Your data could not be submitted");
                console.log({sms})
            }catch(iErr){
                console.log({iErr});
            }
            // return res.badRequest();
        }
    },

    callback: async(req, res) => {
        let pollingUnit = req.pollingUnit;
        let body = req.smsBody;
        if(body.command === 'result'){
            let data = {
                party: body.party,
                vote: parseInt(body.vote),
                raw: body.raw,
          };
          if(controlLevel === 'WARD'){
              console.log({controlLevel});
            let warderPhone = pollingUnit.phone;
            try{
            pollingUnit = await sails.models.pollingunit.findOne({
                pollingUnit: body.pu || 'Unknown PU',
                phone: warderPhone
            });
            }catch(err){
                try{
                    let sms = await sendSMS(warderPhone, "Polling unit not found or not assigned to your phone");
                    console.log({sms})
                }catch(iErr){
                    console.log({iErr});
                }
                res.badRequest();
                return;
            }
            if (!pollingUnit) {
                try{
                    let sms = await sendSMS(warderPhone, "Polling unit not found or not assigned to your phone");
                    console.log({sms})
                }catch(iErr){
                    console.log({iErr});
                }
                res.badRequest();
                return;
            }
            pollingUnit = _.omit(pollingUnit, ['id', 'createdAt', 'updatedAt', 'accountEnabled']);
            data = Object.assign({}, pollingUnit, data);
          }else{
              console.log("by pass");
            data = Object.assign({}, pollingUnit, data);
          }
          
          try{
                console.log({query:  _.omit(data, ['vote', 'raw']), insertIf: data});
                let updated = false;
                if(AppConfig.strictParty && AppConfig.parties.indexOf(data.party) < 0){
                    throw new Error(`stictParty is set, ${data.party} is not allowed in parties config`);
                }

                if(body.resultType == 1){
                    var created = await sails.models.electionresult.findOne(_.omit(data, ['vote', 'raw']));
                }else{
                    created = await sails.models.electionsenateresult.findOne(_.omit(data, ['vote', 'raw']));
                }
                if(!created){
                    if(body.resultType == 1){
                        created = await sails.models.electionresult.create(data).fetch();
                    }else{
                        created = await sails.models.electionsenateresult.create(data).fetch();
                    }
                    try{
                        sails.sockets.broadcast('reload', {type: 'electionresult'});
                        sails.sockets.broadcast('reload', {type: 'electionsenateresult'});
                    }catch(err){
                        console.log({errorCatcher: err});
                    }
                }else{
                    //UPDATE THE LAST VOTE - One Agent Per Polling Unit Per Vote Per Party
                    if(body.resultType == 1){
                        updated = await sails.models.electionresult.update(created).set(Object.assign({}, created, {changeVote: data.vote, updatedAt: Date.now(), raw: data.raw})).fetch();
                    }else{
                        updated = await sails.models.electionsenateresult.update(created).set(Object.assign({}, created, {changeVote: data.vote, updatedAt: Date.now(), raw: data.raw})).fetch();
                    }
                    console.log({updated});
                    try{
                        sails.sockets.broadcast('reload', {type: 'electionresult'});
                        sails.sockets.broadcast('reload', {type: 'electionsenateresult'});
                    }catch(err){
                        console.log({errorCatcher: err});
                    }
                }
                if(created && created.id){
                    try{
                        let sms = await sendSMS(data.phone, (updated ? "Your Election result has been updated for review" : "Your Election result has been submitted"));
                        console.log({sms})
                    }catch(iErr){
                        console.log({iErr});
                    }
                    res.ok(created);
                    return;
                }else{
                    console.log({created});
                    res.badRequest("Unable to insert record");
                    return;
                }
            }catch(err){
                console.log({err});
                try{
                    let sms = await sendSMS(data.phone, "We could not submit result for the party");
                    console.log({sms});
                }catch(iErr){
                    console.log({iErr});
                }
                res.badRequest(err);
                return;
            }
        }else if(body.command === 'incidence'){
            let data = {
                text: body.text,
                raw: body.raw,
          };

          if(controlLevel === 'WARD'){
            let warderPhone = pollingUnit.phone;
            pollingUnit = await sails.models.pollingunit.findOne({
                pollingUnit: body.pu,
                phone: warderPhone
            });
            if (!pollingUnit) {
                try{
                    let sms = await sendSMS(warderPhone, "Polling unit not found or assigned to your phone");
                    console.log({sms})
                }catch(iErr){
                    console.log({iErr});
                }
                res.badRequest();
                return;
            }
            pollingUnit = _.omit(pollingUnit, ['id', 'createdAt', 'updatedAt', 'accountEnabled']);
            data = Object.assign({}, req.incidence, pollingUnit, data);
          }else{
            data = Object.assign({}, req.incidence, pollingUnit, data);
          }

          console.log({data});
          try{
                let created = await sails.models.incidencereport.create(data).fetch();
                try{
                    // sails.models.incidencereport.publish(created);
                    sails.sockets.broadcast('reload', {type: 'incidencereport'});
                }catch(err){
                    console.log({errorCatcher: err});
                }
                if(created && created.id){
                    //Send SMS
                    try{
                        let sms = await sendSMS(data.phone, "Your Incidence report have been submitted");
                        console.log({sms});
                    }catch(iErr){
                        console.log({iErr});
                    }
                    res.ok(created);
                    return;
                }else{
                    console.log({created});
                    res.badRequest("Unable to insert record");
                    return;
                }
            }catch(err){
                console.log({err});
                try{
                    let sms = await sendSMS(data.phone, "An internal server error occured");
                    console.log({sms});
                }catch(iErr){
                    console.log({iErr});
                }
                res.badRequest(err);
                return;
            }
        }else{
            try{
                let sms = await sendSMS(data.phone, "Your data could not be submitted");
                console.log({sms})
            }catch(iErr){
                console.log({iErr});
            }
            return res.badRequest();
        }
    }
};

