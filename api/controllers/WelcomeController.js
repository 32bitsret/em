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

    getSenatorialDashboard: async(req, res) => {
        let electionResults = await sails.models.electionsenateresult.find({});
        let zones = _.uniqBy(electionResults, 'senatorialZone');
        let filterLgas = [], wards = [], pollingUnits = [], pageName = `Senatorial ${AppConfig.electionYear} Poll`;
        if(req.query["zone"]){
                electionResults = await sails.models.electionsenateresult.find({senatorialZone: req.query["zone"]});
                let localGovernments = _.uniqBy(electionResults, 'localGovernment');
                let incidencereport = await sails.models.incidencereport.find({});
                let lgs = _.uniqBy(incidencereport, 'localGovernment');
                for(let i = 0; i < localGovernments.length; i++){
                    filterLgas.push(localGovernments[i].localGovernment.trim());
                }
                for(let i = 0; i < lgs.length; i++){
                    if(filterLgas.indexOf(lgs[i].localGovernment.trim()) == -1){
                        filterLgas.push(lgs[i].localGovernment.trim());
                    }
                }

                pageName = req.query["zone"];
            if(req.query["la"]){
                electionResults = await sails.models.electionsenateresult.find({localGovernment: req.query["la"]});
                wards = _.uniqBy(electionResults, 'ward');
                pageName = req.query["la"];
                if(req.query["ward"]){
                    electionResults = await sails.models.electionsenateresult.find({localGovernment: req.query["la"], ward: req.query["ward"]});
                    pollingUnits = _.uniqBy(electionResults, 'pollingUnit');
                    pageName = pageName + ":" + req.query["ward"];
                    if(req.query["pu"]){
                        pageName = pageName + ":" + req.query["pu"];
                    }
                }
            }
        }
        // sails.models.electionresult.subscribe(req.socket);
        // sails.models.incidencereport.subscribe(req.socket);
        return res.view('pages/dashboard/senate', {
          description: 'Display the welcome page for authenticated users.',
          friendlyName: 'View welcome page',
          electionType: 'Senatorial',
          zones,
          localGovernments: filterLgas,
          wards,
          pageName,
          AppConfig,
          displayErrors: true, //req.query['errors'] ? true : false,
          pollingUnits,
          controlLevel,
          selectedZone: req.query["zone"] || "default",
          selectedLocalGovernment: req.query["la"] || "default",
          selectedWard: req.query["ward"] || 'default',
          selectedPu: req.query["pu"] || 'default'
        });
    },

    getDashboard: async(req, res) => {
        let electionResults = await sails.models.electionresult.find({});
        let incidencereport = await sails.models.incidencereport.find({});
        let localGovernments = _.uniqBy(electionResults, 'localGovernment');
        let lgs = _.uniqBy(incidencereport, 'localGovernment');
        let filterLgas = [];
        for(let i = 0; i < localGovernments.length; i++){
            filterLgas.push(localGovernments[i].localGovernment.trim());
        }
        for(let i = 0; i < lgs.length; i++){
            if(filterLgas.indexOf(lgs[i].localGovernment.trim()) === -1){
                filterLgas.push(lgs[i].localGovernment.trim());
            }
        }
        let wards = [], pollingUnits = [], pageName = `${AppConfig.state} ${AppConfig.electionYear} Poll`;
        if(req.query["la"]){
            console.log({localGovernment: req.query["la"]});
            electionResults = await sails.models.electionresult.find({localGovernment: req.query["la"]});
            wards = _.uniqBy(electionResults, 'ward');
            pageName = req.query["la"];
            if(req.query["ward"]){
                electionResults = await sails.models.electionresult.find({localGovernment: req.query["la"], ward: req.query["ward"]});
                pollingUnits = _.uniqBy(electionResults, 'pollingUnit');
                pageName = pageName + ":" + req.query["ward"];
                if(req.query["pu"]){
                    pageName = pageName + ":" + req.query["pu"];
                }
            }
        }

        let selectedZone = false;
        // sails.models.electionresult.subscribe(req.socket);
        // sails.models.incidencereport.subscribe(req.socket);
        return res.view('pages/dashboard/welcome', {
          description: 'Display the welcome page for authenticated users.',
          friendlyName: 'View welcome page',
          electionType: 'presidential',
          localGovernments: filterLgas,
          wards,
          pageName,
          AppConfig,
          pollingUnits,
          displayErrors: true, //req.query['errors'] ? true : false,
          controlLevel,
          selectedZone,
          selectedLocalGovernment: req.query["la"] || "default",
          selectedWard: req.query["ward"] || 'default',
          selectedPu: req.query["pu"] || 'default'
        });
      },
};

