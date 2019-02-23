"use strict";
/**
 * phone-is-authorize
 *
 * A simple policy that allows any request from an authenticated user.
 *
 */
const sendSMS = require("../lib/sendSMS");
const AppConfig = require("../lib/AppConfig");
const ADMIN_PHONES = AppConfig.admins;

module.exports = async function (req, res, proceed) {
  res.header("Content-Type",'text/x-markdown');
  res.status(200).send("received");
  let phone = req.body.results[0]["from"];
  let sms = req.body.results[0]["text"]; // || cleanText
  console.log({text: sms, cleanText: req.body.results[0]["cleanText"]});
  let formatedText = sms.replace(/\s+/g, ' ').replace(/(\r\n\t|\n|\r\t)/gm,"").replace(/['"]+/g, '');

  if(formatedText.trim().toLowerCase() === "help"){
    try{
        let qsms = await sendSMS(phone, "Presidential Result : 1,PARTY-VOTE,PARTY-VOTE, PU \nSenatorial Result: 3,PARTY-VOTE,PARTY-VOTE, PU \nIncidence: 2,CODE:PU,Your Comment");
        console.log({qsms});
    }catch(iErr){
        console.log({iErr});
    }
    return;
  }

  if(formatedText.split(',')[0] === 'admin' && ADMIN_PHONES.indexOf(phone) >= 0){
    let splitedText = formatedText.split(',');
    try{
        let pu;
        if(splitedText[1] == 1 || splitedText[1] == 3){
            pu = splitedText[splitedText.length - 1];
        }else if(splitedText[1] == 2){
            let codePu = splitedText[2]; 
            if(codePu.split(':').length === 2){
                pu = codePu.split(':')[1];
            }
        }
        console.log({adminPu: pu.trim(), splitedText});
        let pollingUnit = await sails.models.pollingunit.findOne({
                pollingUnit: pu.trim(), 
                accountEnabled: true
        });
        if(pollingUnit){
            req.smsBody = req.smsBody || {};
            req.smsBody.adminUpdate = true;
            req.smsBody.adminPhone = phone;
            phone = pollingUnit.phone;
            formatedText = formatedText.substring(6).trim();
        }else{
            throw new Error("Polling Unit Not Found");
        }
    }catch(err){
        try{
            let qsms = await sendSMS(phone, "Error, Check your input");
            await sails.models.smserror.create({
                sms: sms,
                phone,
                error: "Admin Error: " + err.message
            });
            sails.sockets.broadcast('reload', {type: 'smserrors'});
            console.log({qsms});
        }catch(iErr){
            console.log({iErr});
        }
        // res.send(err.message);
        console.log(err.message);
        return;
    };

  }

  console.log({phone, sms});
  console.log({phone, formatedText});

  let smsTokens = formatedText.split(',');
  smsTokens = smsTokens.map((item, index) => item.trim());

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
            let qsms = await sendSMS(phone, "Error, acceptable format is: 1,PARTY-VOTE,PARTY-VOTE, PU");
            await sails.models.smserror.create({
                sms: sms,
                phone,
                state: pollingUnit.state,
                senatorialZone: pollingUnit.senatorialZone,
                localGovernment: pollingUnit.localGovernment,
                ward: pollingUnit.ward,
                phoneUserName: pollingUnit.phoneUserName
            });
            sails.sockets.broadcast('reload', {type: 'smserrors'});
            console.log({qsms});
        }catch(iErr){
            console.log({iErr});
        }
        // res.send(err.message);
        console.log(err.message);
        return;
    }
  }else{
    try{
        pollingUnit = await sails.models.pollingunit.findOne({
            phone, 
            accountEnabled: true
        });
    }catch(err){
        try{
            let qsms = await sendSMS(phone, "Error, acceptable format: 1,PARTY-VOTE,PARTY-VOTE");
            await sails.models.smserror.create({
                sms: sms,
                phone,
                state: pollingUnit.state,
                senatorialZone: pollingUnit.senatorialZone,
                localGovernment: pollingUnit.localGovernment,
                ward: pollingUnit.ward,
                phoneUserName: pollingUnit.phoneUserName
            });
            sails.sockets.broadcast('reload', {type: 'smserrors'});
            console.log({qsms});
        }catch(iErr){
            console.log({iErr});
        }
        console.log("Check configuration. One phone number is allowed per polling unit");
        // return res.send(err.message);
        return;
    }
  }

  if (pollingUnit) {
    req.pollingUnit = _.omit(pollingUnit, ['id', 'createdAt', 'updatedAt', 'accountEnabled']);
    console.log({smsTokens}, smsTokens[0] == 1, smsTokens[0] === 'result', smsTokens[0] === 'r');
    if(smsTokens[0] == 1 /*|| smsTokens[0] === 'result' || smsTokens[0] === 'r'*/ || smsTokens[0] == 3){

        if(!AppConfig.allowResult){
            try{
                await sails.models.smserror.create({
                    sms: sms,
                    error: "Result not allowed at the moment",
                    phone,
                    state: pollingUnit.state,
                    senatorialZone: pollingUnit.senatorialZone,
                    localGovernment: pollingUnit.localGovernment,
                    ward: pollingUnit.ward,
                    phoneUserName: pollingUnit.phoneUserName
                });
                sails.sockets.broadcast('reload', {type: 'smserrors'});
                return;
            }catch(iErr){
                console.log({iErr});
                return;
            }
        }
        
        req.smsBody = req.smsBody || {};
        req.smsBody.command = 'result'; 
        req.smsBody.resultType = smsTokens[0];
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
        try{
            if(!req.smsBody.pu || !code){
                throw new Error("Invalid Message Format");
            }
            var incidence = await sails.models.incidencetype.findOne({
                incidenceCode: code, 
            });
        }catch(error){
            try{
                let qsms = await sendSMS(phone, AppConfig.controlLevel === 'WARD' ? "Error, acceptable format: 2,CODE:PU,Your Comment" : "Error, acceptable format: 2,CODE,Your Comment");
                await sails.models.smserror.create({
                    sms: sms,
                    error: error.message || "",
                    phone,
                    state: pollingUnit.state,
                    senatorialZone: pollingUnit.senatorialZone,
                    localGovernment: pollingUnit.localGovernment,
                    ward: pollingUnit.ward,
                    phoneUserName: pollingUnit.phoneUserName
                });
                sails.sockets.broadcast('reload', {type: 'smserrors'});
                console.log({qsms});
            }catch(iErr){
                console.log({iErr});
                return;
            }
        }
        if(!incidence){
            try{
                let qsms = await sendSMS(phone, "incidence code does not exist. Acceptable format: " + (AppConfig.controlLevel === 'WARD' ?  "2,CODE:PU,Your Comment" : "2,CODE,Your Comment"));
                await sails.models.smserror.create({
                    sms: sms,
                    phone,
                    error: "incidence not found",
                    state: pollingUnit.state,
                    senatorialZone: pollingUnit.senatorialZone,
                    localGovernment: pollingUnit.localGovernment,
                    ward: pollingUnit.ward,
                    phoneUserName: pollingUnit.phoneUserName
                });
                sails.sockets.broadcast('reload', {type: 'smserrors'});
                console.log({qsms});
            }catch(iErr){
                console.log({iErr});
            }
            // return res.send("incidence 404");
            console.log("incidence 404");
            return;
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
            let qsms = await sendSMS(phone, "Invalid, command sent: Acceptable format is: " + (AppConfig.controlLevel === 'WARD' ?  "2,CODE:PU,Your Comment" : "2,CODE,Your Comment"));
            await sails.models.smserror.create({
                sms: sms,
                phone,
                state: pollingUnit.state,
                senatorialZone: pollingUnit.senatorialZone,
                localGovernment: pollingUnit.localGovernment,
                ward: pollingUnit.ward,
                phoneUserName: pollingUnit.phoneUserName
            });
            sails.sockets.broadcast('reload', {type: 'smserrors'});
            console.log({qsms});
        }catch(iErr){
            console.log({iErr});
        }
        console.log("Invalid, command sent");
        // return res.send("Invalid, command sent");
        return;
    }
    return proceed();
  }
  try{
    let qsms = await sendSMS(phone, "Your phone number is not authorize to perform this operation");
        await sails.models.smserror.create({
            sms: sms,
            phone,
            error: "Unauthorized Phone",
            state: "",
            senatorialZone: "",
            localGovernment: "",
            ward: "",
            phoneUserName: "Unknown User"
        });
        sails.sockets.broadcast('reload', {type: 'smserrors'});
        console.log({qsms});
    }catch(iErr){
        console.log({iErr});
    }
  console.log("unauthorized");
  return;
//   return res.unauthorized();
};
