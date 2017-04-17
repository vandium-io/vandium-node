'use strict';

const helper = require( './helper' );

const TypedHandler = require( './typed' );

function createHandler( type, ...args ) {

    return new TypedHandler( type, helper.extractOptions( args ) )
        .handler( helper.extractHandler( args ) )
        .createLambda();
}

module.exports = createHandler;
