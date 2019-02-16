/**
 * ElectionResultController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

 const _ = require('lodash');

 const AppConfig = require("../lib/AppConfig");

let controlLevel = AppConfig.controlLevel;

module.exports = {
  
    getDashboard: async(req, res) => {
        let electionResults = await sails.models.electionresult.find({});
        let localGovernments = _.uniqBy(electionResults, 'localGovernment');
        let wards = [], pollingUnits = [], pageName = `${AppConfig.state} ${AppConfig.electionYear} Poll`;
        if(req.query["la"]){
            electionResults = await sails.models.electionresult.find({localGovernment: req.query["la"]});
            wards = _.uniqBy(electionResults, 'ward');
            pageName = req.query["la"];
            if(req.query["ward"]){
                electionResults = await sails.models.electionresult.find({localGovernment: req.query["la"], ward: req.query["ward"]});
                pollingUnits = _.uniqBy(electionResults, 'pollingUnit');
                pageName = pageName + ":" + req.query["ward"];
                if(req.query["pu"]){
                    pageName = pageName + ":" + req.query["ward"] + ":" + req.query["pu"];
                }
            }
        }
        return res.view('pages/dashboard/welcome', {
          description: 'Display the welcome page for authenticated users.',
          friendlyName: 'View welcome page',
          localGovernments,
          wards,
          pageName,
          AppConfig,
          pollingUnits,
          controlLevel,
          selectedLocalGovernment: req.query["la"] || "default",
          selectedWard: req.query["ward"] || 'default',
          selectedPu: req.query["pu"] || 'default'
        });
      },
};

