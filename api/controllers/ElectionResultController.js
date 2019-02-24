/**
 * ElectionResultController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

 const _ = require('lodash');

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

    test: async(req, res) => {
        // let electionResults = await sails.models.electionresult.find({
        //     senatorialZone: 'NORTH'
        // });

        // let updateCount = 0, totalElectionResultWithNorth = electionResults.length;
        // for(let i = 0; i < totalElectionResultWithNorth; i++){
        //     await sails.models.electionresult.update(electionResults[i]).set(Object.assign({}, electionResults[i], {senatorialZone: 'NORTHERN'}));
        //     updateCount++;
        // }

        // let electionSenateResults = await sails.models.electionsenateresult.find({
        //     senatorialZone: 'NORTH'
        // });

        // let updateSenateCounter = 0, totalElectionSenateWithNorth = electionSenateResults.length;
        // for(let i = 0; i < totalElectionSenateWithNorth; i++){
        //     await sails.models.electionsenateresult.update(electionSenateResults[i]).set(Object.assign({}, electionSenateResults[i], {senatorialZone: 'NORTHERN'}));
        //     updateSenateCounter++;
        // }

        // res.send({totalElectionResultWithNorth: electionResults.length, 
        //     totalElectionSenateWithNorth: electionSenateResults.length,
        //     updateSenateCounter, updateCount,
        // });
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

