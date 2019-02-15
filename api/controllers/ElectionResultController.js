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
        for(let i = 0; i < parties.length; i++){
            var totalVotes = await db.collection('electionresult').aggregate([
                { "$match": { party: parties[i].party } },
                { "$sort": {"party": -1}},
                { "$group": {
                    _id: null,
                    total: {
                      $sum: "$vote"
                    }
                  }
                }
              ]);
              totalVotes = await totalVotes.toArray();
              console.log({totalVotes: totalVotes});
            ballot.push({party: parties[i].party, totalVotes: totalVotes});
        }
        console.log({results: ballot});
        res.send(ballot);
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

