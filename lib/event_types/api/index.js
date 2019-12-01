const APIHandler = require( './api_handler' );

function createHandler( options ) {

    return new APIHandler( options ).createLambda();
}

module.exports = createHandler;
