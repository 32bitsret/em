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
        v = _.uniqBy(electionresult, 'party');
        console.log(electionresult.length);
        console.log(v.length);
        res.send(v);
    },

    query2: async(req, res) => {


    },

    query3: async(req, res) => {


    }
};

