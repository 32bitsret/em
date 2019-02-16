/**
 * ElectionResult.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝


    party: {
      type: 'string',
      required: true,
      example: '2348161730129'
    },

  vote: {
      type: 'number',
      required: true,
  },

  oldVote: {
    type: 'number',
  },

  raw: {
    type: 'string',
  },

  phone: {
    type: 'string',
    required: true,
    example: '2348161730129'
  },

  pollingUnit: {
    type: 'string',
    required: true,
    description: 'Polling Unit and could be numeric',
  },

  pollingUnitName: {
    type: 'string',
    description: 'Polling Unit Name',
  },

  state: {
      type: 'string',
      description: 'State of Operation and could be numeric',
      defaultsTo: "PLATEAU"
    },
  
  senatorialZone: {
      type: 'string',
      description: 'Could be numeric'
  },

  localGovernment: {
    type: 'string',
    description: 'Could be numeric'
  },

  ward: {
      type: 'string',
      description: 'Could be numeric'
    },

  phoneUserName: {
    type: 'string',
    description: 'Name of the person who owns the phone'
  },
  
    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

  },

};

