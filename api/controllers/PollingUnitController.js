/**
 * PollingUnitController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  put: async (req, res) => {
    return res.send('Hi put there!');
  },

  post: async (req, res) => {
    return res.send('Hi post there!');
  },

  get: async(req, res) => {
    return res.send("PollingUnit");
  }

};

