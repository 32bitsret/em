/**
 * ElectionResultController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

 const _ = require('lodash');

module.exports = {
  
    getDashboard: async(req, res) => {
        let electionResults = await sails.models.electionresult.find({});
        let localGovernments = _.uniqBy(electionResults, 'localGovernment');
        let wards = [], polls = [], pageName = "Plateau State 2019 Poll";
        if(req.query["la"]){
            electionResults = await sails.models.electionresult.find({localGovernment: req.query["la"]});
            wards = _.uniqBy(electionResults, 'ward');
            pageName = req.query["la"];
            if(req.query["ward"]){
                polls = await sails.models.electionresult.find({localGovernment: req.query["la"], ward: req.query["ward"]});
                pageName = pageName + ":" + req.query["ward"];
            }
        }
        return res.view('pages/dashboard/welcome', {
          description: 'Display the welcome page for authenticated users.',
          friendlyName: 'View welcome page',
          localGovernments,
          wards,
          pageName,
          polls,
          selectedLocalGovernment: req.query["la"] || "default",
          selectedWard: req.query["ward"] || 'default'
        });
      },
};

