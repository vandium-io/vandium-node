'use strict';

const helper = require( './helper' );

const TypedHandler = require( './typed' );

function eventProc( event ) {

    return event.Records || event.records;
}

function createHandler( type, ...args ) {

    return new TypedHandler( type, helper.extractOptions( args ) )
        .eventProcessor( eventProc )
        .handler( helper.extractHandler( args ) )
        .createLambda();
}

module.exports = createHandler;
