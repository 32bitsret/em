/**
 * IncidenceReport.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    incidenceCode: {
      type: 'string',
    },

  description: {
      type: 'string',
  },

  text: {
    type: 'string',
  },

  raw: {
    type: 'text',
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

