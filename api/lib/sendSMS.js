const uniqueKey = require('unique-key');
const config = require('../lib/smsConfig');
module.exports = (phone, body) => {
    return new Promise((resolve, reject)=>{
        console.log({phone, body});
        const ebulksms = require('ebulksms')(config.customerId, config.apiKey, { senderId: config.smsTitle });
        ebulksms.send(phone, body, uniqueKey('msg_', 32), {
            flash: false, // (Optional) Default false
        }).then((SMSResponse) => {
            return resolve(SMSResponse);
        }).catch((SMSError) => {
            return reject(SMSError);
        });
    });
    
}