"use strict";
/**
 * ElectionResultController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

 const _ = require('lodash');
 const Json2csvParser = require('json2csv').Parser;

module.exports = {
    // Presidential or Gubernatorial
    query1: async(req, res) => {
        let electionresult = await sails.models.electionresult.find({});
        let parties = _.uniqBy(electionresult, 'party');
        console.log({totalVotes: electionresult.length});
        console.log({totalParties: parties.length});
        let ballot = [];
        var db = sails.getDatastore().manager;
        let match = {};
        if(req.query['localGovernment']){
            match["localGovernment"] = req.query['localGovernment'];
            if(req.query['ward']){
                match["ward"] = req.query['ward'];
                if(req.query['pollingUnit']){
                    match["pollingUnit"] = req.query['pollingUnit'];
                }
            }
        }
        for(let i = 0; i < parties.length; i++){
            match["party"] = parties[i].party;
            var totalVotes = await db.collection('electionresult').aggregate([
                { "$match": match },
                { "$group": {
                    _id: null,
                    total: {
                      $sum: "$vote"
                    }
                  }
                }
              ]);
            totalVotes = await totalVotes.toArray();
            ballot.push({party: parties[i].party, totalVotes: (totalVotes[0] ? totalVotes[0]["total"] : 0)});
        }
        console.log({results: ballot});
        let sortedBallot = _.orderBy(ballot, ['totalVotes'], ['desc']);
        console.log({sortedBallot});
        let firstFourParty = []
        for(let i = 0; (i < 4 && i < sortedBallot.length); i++){
            firstFourParty.push(sortedBallot[i]);
        }
        console.log({firstFourParty});
        let sortedFirstFourParty = _.orderBy(firstFourParty, ['party'], ['asc']);
        console.log({sortedFirstFourParty});
        res.send(sortedFirstFourParty);
        // res.send([{party: 'APC', totalVotes: 87000}, {party: 'PDP', totalVotes: 4999}, {party: 'SDP', totalVotes: 599}])
    },

    // Senatorial
    query2: async(req, res) => {
        let electionresult = await sails.models.electionsenateresult.find({});
        let parties = _.uniqBy(electionresult, 'party');
        console.log({totalVotes: electionresult.length});
        console.log({totalParties: parties.length});
        let ballot = [];
        var db = sails.getDatastore().manager;
        let match = {};
        if(req.query['senatorialZone']){
            match["senatorialZone"] = req.query['senatorialZone'];
            if(req.query['localGovernment']){
                match["localGovernment"] = req.query['localGovernment'];
                if(req.query['ward']){
                    match["ward"] = req.query['ward'];
                    if(req.query['pollingUnit']){
                        match["pollingUnit"] = req.query['pollingUnit'];
                    }
                }
            }
        }
        for(let i = 0; i < parties.length; i++){
            match["party"] = parties[i].party;
            var totalVotes = await db.collection('electionsenateresult').aggregate([
                { "$match": match },
                { "$group": {
                    _id: null,
                    total: {
                      $sum: "$vote"
                    }
                  }
                }
              ]);
            totalVotes = await totalVotes.toArray();
            ballot.push({party: parties[i].party, totalVotes: (totalVotes[0] ? totalVotes[0]["total"] : 0)});
        }
        console.log({results: ballot});
        let sortedBallot = _.orderBy(ballot, ['totalVotes'], ['desc']);
        console.log({sortedBallot});
        let firstFourParty = []
        for(let i = 0; (i < 4 && i < sortedBallot.length); i++){
            firstFourParty.push(sortedBallot[i]);
        }
        console.log({firstFourParty});
        let sortedFirstFourParty = _.orderBy(firstFourParty, ['party'], ['asc']);
        console.log({sortedFirstFourParty});
        res.send(sortedFirstFourParty);
        // res.send([{party: 'APC', totalVotes: 87000}, {party: 'PDP', totalVotes: 4999}, {party: 'SDP', totalVotes: 599}])
    },

    top10apcpdp: async(req, res) => {
        let results = await sails.models.electionresult.find({where: { or: [{party: 'APC'}, {party: 'PDP'}] }, 
            /*select: ['party', 'vote', '']*/});
        let pus = _.groupBy(results, (result) => { return result.pollingUnit});
        // var refined = pus.map( (result, index, array) => {
        //     let newItem = {}, apcVote = 0, pdpVote;
        //     for(let i = 0; i < result.length; i++){
        //         if(result[i].party === 'PDP'){
        //             pdpVote = result[i].vote;
        //         }
        //         if(result[i].party === 'APC'){
        //             apcVote = result[i].vote;
        //         }
        //     }
        //     newItem = Object.assign(newItem, 
        //         _.omit(result[0], ['id', 'createdAt', 'updatedAt','oldVote', 
        //         'changeVote', 'raw', 'phoneUserName', 'adminPhone']), {diff: pdpVote - apcVote});
        //     return newItem;
        // });
        // let headers = Object.keys(refined[0]).map( (item, index, array) => {
        //     return item;
        // });
        // const json2csvParser = new Json2csvParser({headers});
        // const csv = json2csvParser.parse(refined);
        // const options = {
        //     fileName  : 'PartyDiff-reports', // String value for assigning a name for the Excel file created.
        //     // path : __dirname + '/storage' // String value to define your own storage path where the excel file will be saved.
        // }
        // res.setHeader('Content-Disposition', `attachment;filename=${options.fileName}.csv`);
        // res.setHeader('Content-Type', `text/csv`);
        // res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
        // return res.status(200).send(csv);
        return res.status(200).send(pus);
    },

    top10apc: async(req, res) => {
        let results = await sails.models.electionresult.find({party: 'APC'}).sort([{vote: 'DESC'}]).limit(50);
        let headers = Object.keys(results[0]).map( (item, index, array) => {
            return item;
        });
        const json2csvParser = new Json2csvParser({headers});
        const csv = json2csvParser.parse(results);
        const options = {
            fileName  : 'topAPC-reports', // String value for assigning a name for the Excel file created.
            // path : __dirname + '/storage' // String value to define your own storage path where the excel file will be saved.
        }
        res.setHeader('Content-Disposition', `attachment;filename=${options.fileName}.csv`);
        res.setHeader('Content-Type', `text/csv`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
        return res.status(200).send(csv);

    },

    top10pdp: async(req, res) => {
        let results = await sails.models.electionresult.find({party: 'PDP'}).sort([{vote: 'DESC'}]).limit(50);
        let headers = Object.keys(results[0]).map( (item, index, array) => {
            return item;
        });
        const json2csvParser = new Json2csvParser({headers});
        const csv = json2csvParser.parse(results);
        const options = {
            fileName  : 'topPDP-reports', // String value for assigning a name for the Excel file created.
            // path : __dirname + '/storage' // String value to define your own storage path where the excel file will be saved.
        }
        res.setHeader('Content-Disposition', `attachment;filename=${options.fileName}.csv`);
        res.setHeader('Content-Type', `text/csv`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
        return res.status(200).send(csv);
    },

    dumpPusWithoutResult: async(req, res) => {
        let match = {};
        if(req.query['localGovernment']){
            match["localGovernment"] = req.query['localGovernment'];
            if(req.query['ward']){
                match["ward"] = req.query['ward'];
                if(req.query['pollingUnit']){
                    match["pollingUnit"] = req.query['pollingUnit'];
                }
            }
        }
        let pollingUnits = await sails.models.pollingunit.find(match);
        if(req.query['collection'] === 'senate'){
            var pollingUnitsWithRes = await sails.models.electionsenateresult.find({});
        }else{
            pollingUnitsWithRes = await sails.models.electionresult.find({});
        }
        let pollingUnitWithoutRes = [];
        let pollingUnitCount =  pollingUnits.length;
        let pollingUnitsWithResCount = pollingUnitsWithRes.length;
        for(let i = 0; i < pollingUnitCount; i++){
            let found = false;
            for(let j = 0; j < pollingUnitsWithResCount; j++){
                if(pollingUnits[i].pollingUnit === pollingUnitsWithRes[j].pollingUnit){
                    found = true;
                    break;
                }
            }
            if(!found){
                pollingUnitWithoutRes.push(pollingUnits[i]);
            }
        }

        if(pollingUnitWithoutRes.length === 0){
            return res.send("All results have been submitted");
        }

        let headers = Object.keys(pollingUnitWithoutRes[0]).map( (item, index, array) => {
            return item;
        });
        const json2csvParser = new Json2csvParser({headers});
        const csv = json2csvParser.parse(pollingUnitWithoutRes);
        const options = {
            fileName  : 'em-reports', // String value for assigning a name for the Excel file created.
            // path : __dirname + '/storage' // String value to define your own storage path where the excel file will be saved.
        }
        res.setHeader('Content-Disposition', `attachment;filename=${options.fileName}.csv`);
        res.setHeader('Content-Type', `text/csv`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
        return res.status(200).send(csv);
    },

    test: async(req, res) => {
        let electionResults = await sails.models.electionresult.find({
            senatorialZone: 'NORTH'
        });

        let updateCount = 0, totalElectionResultWithNorth = electionResults.length;
        for(let i = 0; i < totalElectionResultWithNorth; i++){
            await sails.models.electionresult.update(electionResults[i]).set(Object.assign({}, electionResults[i], {senatorialZone: 'NORTHERN'}));
            updateCount++;
        }

        let electionSenateResults = await sails.models.electionsenateresult.find({
            senatorialZone: 'NORTH'
        });

        let updateSenateCounter = 0, totalElectionSenateWithNorth = electionSenateResults.length;
        for(let i = 0; i < totalElectionSenateWithNorth; i++){
            await sails.models.electionsenateresult.update(electionSenateResults[i]).set(Object.assign({}, electionSenateResults[i], {senatorialZone: 'NORTHERN'}));
            updateSenateCounter++;
        }

        let incidenceReportResults = await sails.models.incidencereport.find({
            senatorialZone: 'NORTH'
        });

        let updateIncidenceReportCounter = 0, totalIncidenceReportWithNorth = incidenceReportResults.length;
        for(let i = 0; i < totalIncidenceReportWithNorth; i++){
            await sails.models.incidencereport.update(incidenceReportResults[i]).set(Object.assign({}, incidenceReportResults[i], {senatorialZone: 'NORTHERN'}));
            updateIncidenceReportCounter++;
        }

        res.send({totalElectionResultWithNorth, 
            totalElectionSenateWithNorth,
            updateSenateCounter, updateCount, updateIncidenceReportCounter, totalIncidenceReportWithNorth,
        });
    },


    query3: async(req, res) => {
        // let db = sails.getDatastore().manager;
        let match = {};
        if(req.query['localGovernment']){
            match["localGovernment"] = req.query['localGovernment'];
            if(req.query['ward']){
                match["ward"] = req.query['ward'];
                if(req.query['pollingUnit']){
                    match["pollingUnit"] = req.query['pollingUnit'];
                }
            }
        }
        let pollingUnits = await sails.models.pollingunit.find(match);
        if(req.query['collection'] === 'senate'){
            var pollingUnitsWithRes = await sails.models.electionsenateresult.find({});
        }else{
            pollingUnitsWithRes = await sails.models.electionresult.find({});
        }
        let pollingUnitWithoutRes = [];
        let pollingUnitCount =  pollingUnits.length;
        let pollingUnitsWithResCount = pollingUnitsWithRes.length;
        for(let i = 0; i < pollingUnitCount; i++){
            let found = false;
            for(let j = 0; j < pollingUnitsWithResCount; j++){
                if(pollingUnits[i].pollingUnit === pollingUnitsWithRes[j].pollingUnit){
                    found = true;
                    break;
                }
            }
            if(!found){
                pollingUnitWithoutRes.push(pollingUnits[i]);
            }
        }
        pollingUnitsWithRes = _.uniqBy(pollingUnitsWithRes, 'pollingUnit');
        res.send({data: pollingUnitWithoutRes, pollingUnitsWithResCount: pollingUnitsWithRes.length, pollingUnitCount});
        
    },
   
};

