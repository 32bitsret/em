"use strict";
/**
 * PollingUnitController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const csvParser = require("csv-parse");
const _ = require("lodash");

const SN = 0;
const STATE = 1;
const SENATORIAL_ZONE = 2
const LOCAL_GOVERNMENT = 3
const WARD = 4;
const POLLING_UNIT_NAME = 5;
const POLLING_UNIT_DELIMITATION = 6;
const AGENT_PHONE = 7;
const AGENT_NAME = 8;

module.exports = {

  import: async(req, res) => {
    if(!req.query.raw){
      res.send("raw is undefined, did you ?raw=1");
      return;
    }
    csvParser(req.rawBody, async(err, pollingUnitMappings)=>{
      if(err){
        res.send({err});
        return;
      }

      if(pollingUnitMappings.length && pollingUnitMappings[0].length != 9){
        res.send("invalid excel sheet. 9 columns expected" + req.params);
        return;
      }

      if(!_.isNumber(parseInt(pollingUnitMappings[0][SN]))){
        res.send("Column 1 row 1 must be a number. If you have headers, remove them before importing");
        return;
      }

      let results = [], errorCount = 0, updateCount = 0, insertCount = 0, errorMessage = [];
      for(let i = 0; i < pollingUnitMappings.length; i++){
        try{
          let updated = false;
          var query = {
            pollingUnit: pollingUnitMappings[i][POLLING_UNIT_DELIMITATION].trim(),
          }
          let created = await sails.models.pollingunit.findOne(query);
          var data = {
            phone: pollingUnitMappings[i][AGENT_PHONE].trim(),
            pollingUnit: pollingUnitMappings[i][POLLING_UNIT_DELIMITATION].trim(),
            pollingUnitName: pollingUnitMappings[i][POLLING_UNIT_NAME].trim().toUpperCase(),
            state: pollingUnitMappings[i][STATE].trim().toUpperCase(),
            senatorialZone: pollingUnitMappings[i][SENATORIAL_ZONE].trim().toUpperCase(),
            localGovernment: pollingUnitMappings[i][LOCAL_GOVERNMENT].trim().toUpperCase(),
            ward: pollingUnitMappings[i][WARD].trim().toUpperCase(),
            phoneUserName: pollingUnitMappings[i][AGENT_NAME].trim().toUpperCase(),
          };
          if(!created){
              created = await sails.models.pollingunit.create(data);
              insertCount++;
          }else{
              //UPDATE THE LAST VOTE - One Agent Per Polling Unit Per Vote Per Party
              updated = await sails.models.pollingunit.update(created).set(Object.assign({}, created, data)).fetch();
              updateCount++;
          }
        }catch(err){
            results[i] = false;
            errorMessage.push(err.message);
            errorCount++;
        }
      }//endfor
      console.log({errorMessage});
      res.send(`Insert Count: ${insertCount}, Update Count: ${updateCount}, Error count: ${errorCount}`)
    });
  }
};

