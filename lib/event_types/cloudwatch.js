'use strict';

const helper = require( './helper' );

const TypedHandler = require( './typed' );

function createHandler( type, ...args ) {

    return new TypedHandler( 'cloudwatch', helper.extractOptions( args ) )
        .matchSubType( type )
        .handler( helper.extractHandler( args ) )
        .createLambda();
}

module.exports = createHandler;
