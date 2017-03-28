'use strict';

const MethodHandler = require( './method' );

const JWTValidator = require( './jwt' );

const constants = require( './constants' );

function extractOptions( args ) {

    return (args.length === 1 ? {} : args[0] );
}

function extractHandler( args ) {

    return (args.length === 1 ? args[0] : args[1] );
}

function createMethodHandler( args ) {

    let handler = extractHandler( args );
    let options = extractOptions( args );

    return new MethodHandler( handler, options )
}


class APIHandler {

    constructor( options ) {

        options = options || {};

        this.jwt = new JWTValidator( options.jwt || options.JWT );
        this.methodHandlers = {};
    }

    jwt( options ) {

        this.jwt = new JWTValidator( options );

        return this;
    }

    execute( event, context, callback ) {

        try {

            let method = event.httpMethod;

            if( !method ) {

                throw new Error( 'Missing httpMethod property in event object' );
            }

            let handler = this.methodHandlers[ method ];

            if( !handler ) {

                throw new Error( 'Handler not defined for http method: ' + method );
            }

            this.jwt.validate( event );

            handler.execute( event, context )
                .then( (result) => {

                    // do finally

                    callback( null, result );
                })
                .catch( ( err ) => {

                    // do finally

                    callback( err );
                });
        }
        catch( err ) {

            callback( err );
        }
    }

    finally() {

        // TODO: add finally handler
    }

    _addHandler( type, ...args ) {

        this.methodHandlers[ type ] = createMethodHandler( args );
        return this;
    }
}

// add http methods to APIHandler class
constants.HTTP_METHODS.forEach( (methodType) => {

    APIHandler.prototype[ methodType ] = function( ...args ) {

        return this._addHandler( methodType, ...args );
    }
});


module.exports = APIHandler;
