/**
 * phone-is-authorize
 *
 * A simple policy that allows any request from an authenticated user.
 *
 */
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

  let pollingUnit = await sails.models.pollingunit.findOne({
        phone: "2348161730129", 
        accountEnabled: true
  });
  if (pollingUnit) {
    req.pollingUnit = _.omit(pollingUnit, ['id', 'createdAt', 'updatedAt', 'accountEnabled']);
    if(smsTokens[1] === 1 || smsTokens[1] === 'result' || smsTokens[1] === 'r'){
        console.log({smsTokens});
        req.smsBody = req.smsBody || {};
        req.smsBody.command = 'result';
        req.smsBody.party = smsTokens[2].toUpperCase();
        req.smsBody.vote = smsTokens[3];
        req.smsBody.raw = JSON.stringify(sms);
    }else if(smsTokens[1] === 2 || smsTokens[1] === 'incidence' || smsTokens[1] === 'i'){

        console.log({smsTokens});
        let incidence = await sails.models.incidencetype.findOne({
            incidenceCode: smsTokens[2], 
        });
        if(!incidence){
            return res.send("incidence 404");
        }
        let text = '';
        for(let i = 3; i < smsTokens.length; i++){
            text += ' ' + smsTokens[i];
        }
        req.incidence = _.omit(incidence, ['id', 'createdAt', 'updatedAt']);
        req.smsBody = req.smsBody || {};
        req.smsBody.command = 'incidence';
        req.smsBody.incidenceCode = smsTokens[2];
        req.smsBody.text = text.trim();
        req.smsBody.raw = JSON.stringify(sms);
    }else{
        return res.send("Invalid, command sent");
    }
    return proceed();
  }
  return res.unauthorized();
};
