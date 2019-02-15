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
        for(let i = 0; i < parties.length; i++){
            var totalVotes = await sails.models.electionresult.sum('vote', {party: parties[i].party});
            ballot.push({party: parties[i].party, totalVote});
        }
        console.log({results: ballot});
        res.send(ballot);
    },

    query2: async(req, res) => {


    },

    query3: async(req, res) => {


    }
};

