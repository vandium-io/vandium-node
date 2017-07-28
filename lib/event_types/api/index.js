'use strict';

const APIHandler = require( './api_handler' );

function createHandler( config ) {

    return new APIHandler( config ).createLambda();
}

module.exports = createHandler;
