/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * (for additional recommended settings, see `config/env/production.js`)
 *
 * For more information on configuration, check out:
 * https://sailsjs.com/config/http
 */

var express = require('express');

module.exports.http = {

  /****************************************************************************
  *                                                                           *
  * Sails/Express middleware to run for every HTTP request.                   *
  * (Only applies to HTTP requests -- not virtual WebSocket requests.)        *
  *                                                                           *
  * https://sailsjs.com/documentation/concepts/middleware                     *
  *                                                                           *
  ****************************************************************************/

  middleware: {

    /***************************************************************************
    *                                                                          *
    * The order in which middleware should be run for HTTP requests.           *
    * (This Sails app's routes are handled by the "router" middleware below.)  *
    *                                                                          *
    ***************************************************************************/

    order: [
      'rawBodyParser',
      'cookieParser',
      'session',
      'bodyParser',
      'compress',
      'poweredBy',
      'router',
      'www',
      'favicon',
      'customMiddleware',
    ],


    /***************************************************************************
    *                                                                          *
    * The body parser that will handle incoming multipart HTTP requests.       *
    *                                                                          *
    * https://sailsjs.com/config/http#?customizing-the-body-parser             *
    *                                                                          *
    ***************************************************************************/

    // bodyParser: (function _configureBodyParser(){
    //   var skipper = require('skipper');
    //   var middlewareFn = skipper({ strict: true });
    //   return middlewareFn;
    // })(),

    rawBodyParser: (function (){
      console.log('Initializing `rawBodyParser` (HTTP middleware)...');
      return function (req, res, next) {
        if(!req.query['raw']){
          next();
          return;
        }
        console.log("Processing by rawBodyParser");
        let data = '';
        req.setEncoding('utf8');
        req.on('data', function(chunk) {
          data += chunk;
        });
        req.on('end', function() {
          req.rawBody = data;
          return next();
        });
      };
    })(),

    customMiddleware: function (app) {
      // this code will be executed only once during the application startup
      app.use(express.static('assets'));
    }
  
  

  },

};
