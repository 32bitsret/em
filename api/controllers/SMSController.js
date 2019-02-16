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
  
    callbackV2: async(req, res) => {
        let pollingUnit = req.pollingUnit;
        let body = req.smsBody;
        if(body.command === 'result'){
          let data = [];
            
          if(controlLevel === 'WARD'){
              console.log({controlLevel});
            var warderPhone = pollingUnit.phone;
            console.log({"chck": body.pu});
            pollingUnit = await sails.models.pollingunit.findOne({
                pollingUnit: body.pu || "Unknown PU",
            });
            if (!pollingUnit) {
                try{
                    let sms = await sendSMS(warderPhone, "Polling unit not found");
                    console.log({sms})
                }catch(iErr){
                    console.log({iErr});
                }
                res.badRequest("Polling unit not found");
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
                    let created = await sails.models.electionresult.findOne(_.omit(data[i], ['vote', 'raw']));
                    if(!created){
                        created = await sails.models.electionresult.create(data[i]);
                        sails.models.electionresult.publishCreate(created);
                        insertCount++;
                    }else{
                        //UPDATE THE LAST VOTE - One Agent Per Polling Unit Per Vote Per Party
                        updated = await sails.models.electionresult.update(created).set(Object.assign({}, created, {oldVote: created.vote, updatedAt: Date.now(), vote: data[i].vote, raw: data[i].raw})).fetch();
                        console.log({updated});
                        sails.models.electionresult.publishCreate(updated);
                        updateCount++;
                    }
                }catch(err){
                    results[i] = false;
                    errorMessage.push(err.message);
                    errorCount++;
                }
            }

            try{
                let sms = await sendSMS(warderPhone, `Insert Count: ${insertCount}, Update Count: ${updateCount}, Error count: ${errorCount}`);
                console.log({sms})
            }catch(iErr){
                console.log({iErr});
            }
            console.log({errorMessage, insertCount, updateCount, errorCount})
            res.ok();
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
            });
            if (!pollingUnit) {
                try{
                    let sms = await sendSMS(warderPhone, "Polling unit not found");
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
                sails.models.incidencereport.publishCreate(created);
                if(created && created.id){
                    //Send SMS
                    try{
                        let sms = await sendSMS(warderPhone, "Your Incidence report have been submitted");
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
                    let sms = await sendSMS(warderPhone, "An internal server error occured");
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
            pollingUnit = await sails.models.pollingunit.findOne({
                pollingUnit: body.pu || 'Unknown PU',
            });
            if (!pollingUnit) {
                try{
                    let sms = await sendSMS(warderPhone, "Polling unit not found");
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
                if(AppConfig.strictParty && AppConfig.parties.indexOf(data[i].party) < 0){
                    throw new Error(`stictParty is set, ${data[i].party} is not allowed in parties config`);
                }
                let created = await sails.models.electionresult.findOne(_.omit(data, ['vote', 'raw']));
                if(!created){
                    created = await sails.models.electionresult.create(data);
                    sails.models.electionresult.publishCreate(created);
                }else{
                    //UPDATE THE LAST VOTE - One Agent Per Polling Unit Per Vote Per Party
                    updated = await sails.models.electionresult.update(created).set(Object.assign({}, created, {oldVote: created.vote, updatedAt: Date.now(), vote: data.vote, raw: data.raw})).fetch();
                    console.log({updated});
                    sails.models.electionresult.publishCreate(updated);
                }
                if(created && created.id){
                    try{
                        let sms = await sendSMS(data.phone, (updated ? "Your Election Result has been updated" : "Your Election Result has been submitted"));
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
            });
            if (!pollingUnit) {
                try{
                    let sms = await sendSMS(warderPhone, "Polling unit not found");
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
                sails.models.incidencereport.publishCreate(created);
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

