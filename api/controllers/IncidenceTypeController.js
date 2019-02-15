"use strict";
/**
 * IncidenceTypeController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const csvParser = require("csv-parse");

const SN = 0;
const INCIDENCE_CODE = 1;
const INCIDENCE_DESCRIPTION = 2;

module.exports = {
    import: async(req, res) => {
        if(!req.query.raw){
            res.send("raw is undefined, did you ?raw=1");
            return;
        }
        csvParser(req.rawBody, async(err, incidenceTypes)=>{
            if(err){
              res.send({err});
              return;
            }
            if(incidenceTypes.length && incidenceTypes[0].length != 3){
                res.send("invalid excel sheet. 3 columns expected" + req.params);
                return;
            }
            let results = [], errorCount = 0, updateCount = 0, insertCount = 0, errorMessage = [];
            for(let i = 0; i < incidenceTypes.length; i++){
              try{
                let updated = false;
                var query = {
                    incidenceCode: incidenceTypes[i][INCIDENCE_CODE].trim(),
                }
                let created = await sails.models.incidencetype.findOne(query);
                var data = {
                  incidenceCode: incidenceTypes[i][INCIDENCE_CODE].trim().toUpperCase(),
                  description: incidenceTypes[i][INCIDENCE_DESCRIPTION].trim().toUpperCase(),
                };
                if(!created){
                    created = await sails.models.incidencetype.create(data);
                    insertCount++;
                }else{
                    //UPDATE THE LAST VOTE - One Agent Per Polling Unit Per Vote Per Party
                    updated = await sails.models.incidencetype.update(created).set(Object.assign({}, created, data)).fetch();
                    updateCount++;
                }
              }catch(err){
                  results[i] = false;
                  errorMessage.push(err.message);
                  errorCount++;
              }
            }//endfor
            res.send(`Insert Count: ${insertCount}, Update Count: ${updateCount}, Error count: ${errorCount}`)
          });
    }
};

