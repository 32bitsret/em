/**
 * ElectionResultController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

 const _ = require('lodash');

module.exports = {
  
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
            ballot.push({party: parties[i].party, totalVotes: totalVotes[0]["total"]});
        }
        console.log({results: ballot});
        res.send(ballot);
        // res.send([{party: 'APC', totalVotes: 87000}, {party: 'PDP', totalVotes: 4999}, {party: 'SDP', totalVotes: 599}])
    },

    query2: async(req, res) => {
        var db = sails.getDatastore().manager;
        var totalVotes = await db.collection('electionresult').aggregate([
            { "$match": { party: parties[i].party } },
            { "$sort": {"party": -1}}
          ])
    },

    query3: async(req, res) => {


    }
};

