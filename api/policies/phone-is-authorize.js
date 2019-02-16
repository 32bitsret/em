/**
 * phone-is-authorize
 *
 * A simple policy that allows any request from an authenticated user.
 *
 */
const sendSMS = require("../lib/sendSMS");
const AppConfig = require("../lib/AppConfig");

module.exports = async function (req, res, proceed) {
  let sms = req.body.message;
  let phone = req.body.phoneNumber;
  if(!sms){
    return res.send("No data, available");
  }
  let smsTokens = sms.replace(/\s+/g, ' ').split(' ');
  // [0] => Keyword, 
  // [1] => command 1 or r or result || 2 or i or incidence
  // [2] => party (PDP, APC etc) || category, 
  // [3] Votes (party) or incidence text (incidence)
  var pollingUnit;
  if(AppConfig.controlLevel === 'WARD'){
    try{
        pollingUnit = await sails.models.pollingunit.find({
                phone, 
                accountEnabled: true
        });
        if(pollingUnit.length){
            pollingUnit = pollingUnit[0];
        }
    }catch(err){
        try{
            let sms = await sendSMS(phone, "An Error Occured");
            console.log({sms});
        }catch(iErr){
            console.log({iErr});
        }
        return res.send(err.message);
    }
  }else{
    try{
        pollingUnit = await sails.models.pollingunit.findOne({
            phone, 
            accountEnabled: true
        });
    }catch(err){
        try{
            let sms = await sendSMS(phone, "An Error Occured");
            console.log({sms});
        }catch(iErr){
            console.log({iErr});
        }
        console.log("Check configuration. One phone number is allowed per polling unit");
        return res.send(err.message);
    }
  }
  if (pollingUnit) {
    req.pollingUnit = _.omit(pollingUnit, ['id', 'createdAt', 'updatedAt', 'accountEnabled']);
    if(smsTokens[1] == 1 || smsTokens[1] === 'result' || smsTokens[1] === 'r'){
        console.log({smsTokens});
        req.smsBody = req.smsBody || {};
        req.smsBody.command = 'result';
        req.smsBody.party = smsTokens[2].toUpperCase();
        req.smsBody.vote = smsTokens[3];
        req.smsBody.pu = smsTokens[4] || null;
        console.log("PU", req.smsBody.pu)
        req.smsBody.raw = JSON.stringify(sms);
    }else if(smsTokens[1] == 2 || smsTokens[1] === 'incidence' || smsTokens[1] === 'i'){

        console.log({smsTokens});
        req.smsBody = req.smsBody || {};
        let code = smsTokens[2]; 
        req.smsBody.pu = null;
        if(code.split(',').length === 2){
            code = code.split(',')[0];
            req.smsBody.pu = code.split(',')[1];
        }
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
        for(let i = 3; i < smsTokens.length; i++){
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
