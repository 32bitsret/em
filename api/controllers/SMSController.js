/**
 * ElectionResultController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const _ = require('lodash');
const sendSMS = require("../lib/sendSMS");

module.exports = {
  
    callback: async(req, res) => {
        let pollingUnit = req.pollingUnit;
        let body = req.smsBody;
        if(body.command === 'result'){
            let data = {
                party: body.party,
                vote: parseInt(body.vote),
                raw: body.raw,
          };
          data = Object.assign({}, pollingUnit, data);
          try{
                console.log({query:  _.omit(data, ['vote', 'raw']), insertIf: data});
                let updated = false;
                let created = await sails.models.electionresult.findOne(_.omit(data, ['vote', 'raw']));
                if(!created){
                    let created = await sails.models.electionresult.create(data);
                }else{
                    //UPDATE THE LAST VOTE - One Agent Per Polling Unit Per Vote Per Party
                    updated = await sails.models.electionresult.update(created).set(Object.assign({}, created, {vote: data.vote, raw: data.raw})).fetch();
                    console.log({updated});
                }
                if(created && created.id){
                    try{
                        let sms = await sendSMS(data.phone, (updated ? "Your Election Result has been updated" : "Your Election Result has been submitted"));
                        console.log({sms})
                    }catch(iErr){
                        console.log({iErr});
                    }
                    res.ok(created);
                }else{
                    console.log({created});
                    res.badRequest("Unable to insert record");
                }
            }catch(err){
                console.log({err});
                res.badRequest(err);
                try{
                    let sms = await sendSMS(data.phone, "An internal server error occured");
                    console.log({sms});
                }catch(iErr){
                    console.log({iErr});
                }
            }
            return;
        }else if(body.command === 'incidence'){
            let data = {
                text: body.text,
                raw: body.raw,
          };
          data = Object.assign({}, req.incidence, pollingUnit, data);
          console.log({data});
          try{
                let created = await sails.models.incidencereport.create(data).fetch();;
                if(created && created.id){
                    //Send SMS
                    try{
                        let sms = await sendSMS(data.phone, "Your Incidence report have been submitted");
                        console.log({sms});
                    }catch(iErr){
                        console.log({iErr});
                    }
                    res.ok(created);
                }else{
                    console.log({created});
                    res.badRequest("Unable to insert record");
                }
            }catch(err){
                console.log({err});
                res.badRequest(err);
                try{
                    let sms = await sendSMS(data.phone, "An internal server error occured");
                    console.log({sms});
                }catch(iErr){
                    console.log({iErr});
                }
            }
            return;
        }
        try{
            let sms = await sendSMS(data.phone, "Your data could not be submitted");
            console.log({sms})
        }catch(iErr){
            console.log({iErr});
        }
        return res.badRequest();
    }
};

