"use strict";
/**
 * phone-is-authorize
 *
 * A simple policy that allows any request from an authenticated user.
 *
 */
const sendSMS = require("../lib/sendSMS");

module.exports = async function (req, res, proceed) {
  let phone = req.body.results[0]["from"];
  let sms = req.body.results[0]["text"]; // || cleanText

  console.log({phone, sms});

  let smsTokens = sms.replace(/\s+/g, ' ').split(',');
  smsTokens = smsTokens.map((item, index) => item.trim());

  let pollingUnit = await sails.models.pollingunit.findOne({
        phone,//: "2348161730129", 
        accountEnabled: true
  });
  if (pollingUnit) {
    req.pollingUnit = _.omit(pollingUnit, ['id', 'createdAt', 'updatedAt', 'accountEnabled']);
    console.log({smsTokens}, smsTokens[0] == 1, smsTokens[0] === 'result', smsTokens[0] === 'r');
    if(smsTokens[0] == 1 || smsTokens[0] === 'result' || smsTokens[0] === 'r'){
        
        req.smsBody = req.smsBody || {};
        req.smsBody.command = 'result';
        let results = [];
        for(let i = 1; i < smsTokens.length; i++){
            let tmp = smsTokens[i].split('-');
            if(tmp.length === 2){
                results.push({party: tmp[0].toUpperCase(), vote: tmp[1]});
            }else if(tmp.length === 1){
                req.smsBody.pu = tmp[0] || null;
            }
        }
        console.log("PU", req.smsBody.pu, results);
        req.smsBody.raw = JSON.stringify(sms);
        req.smsBody.results = results;
    }else if(smsTokens[0] == 2 || smsTokens[0] === 'incidence' || smsTokens[0] === 'i'){

        req.smsBody = req.smsBody || {};
        let codePu = smsTokens[1]; 
        req.smsBody.pu = null;
        if(codePu.split(':').length === 2){
            var code = codePu.split(':')[0];
            req.smsBody.pu = codePu.split(':')[1];
        }
        console.log("PU", req.smsBody.pu, code);
        let incidence = await sails.models.incidencetype.findOne({
            incidenceCode: code, 
        });
        if(!incidence){
            try{
                let sms = await sendSMS(phone, "incidence code does not exist.");
                console.log({sms});
            }catch(iErr){
                console.log({iErr});
            }
            return res.send("incidence 404");
        }
        let text = '';
        for(let i = 2; i < smsTokens.length; i++){
            text += ' ' + smsTokens[i];
        }
        req.incidence = _.omit(incidence, ['id', 'createdAt', 'updatedAt']);
        req.smsBody.command = 'incidence';
        req.smsBody.incidenceCode = smsTokens[2];
        req.smsBody.text = text.trim();
        req.smsBody.raw = JSON.stringify(sms);
    }else{
        try{
            let sms = await sendSMS(phone, "Invalid, command sent");
            console.log({sms});
        }catch(iErr){
            console.log({iErr});
        }
        return res.send("Invalid, command sent");
    }
    return proceed();
  }
  try{
    let sms = await sendSMS(phone, "Your phone number is not authorize to perform this operation");
        console.log({sms});
    }catch(iErr){
        console.log({iErr});
    }
  return res.unauthorized();
};
