module.exports = {
    apiKey: process.env.EBULK_APIKEY || "3f81d1095b2d80d2c8946eeac0fa32011c5c3e07",
    customerId: process.env.EBULK_CUSTOMER_ID || "sales@logicaladdress.com",
    restEndpoint: "http://api.ebulksms.com:8080",
    smsTitle: process.env.SMS_TITLE || "Monitor"
}