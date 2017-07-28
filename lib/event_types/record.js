'use strict';

const helper = require( './helper' );

const RecordHandler = require( './record_handler' );

function createHandler( type, ...args ) {

    return new RecordHandler( type, helper.extractOptions( args ), helper.extractHandler( args ) )
        .createLambda();
}

module.exports = createHandler;
