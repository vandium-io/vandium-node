'use strict';

const identifier = require( '@vandium/event-identifier' );

const utils = require( '../../utils' );

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


function doFinally( afterFunc, handlerContext ) {

    let finallyPromise;

    try {

        if( afterFunc.length === 0 ) {

            finallyPromise = Promise.resolve( afterFunc.call( handlerContext ) );
        }
        else {

            finallyPromise = utils.asPromise( afterFunc, handlerContext );
        }
    }
    catch( err ) {

        console.log( err );

        finallyPromise = Promise.resolve();
    }

    return finallyPromise.then(

            () => {

                // TODO: log?
            },
            (err) => {

                // TODO: log error
            }
        );
}

function getStatusCode( httpMethod ) {

    switch( httpMethod ) {

        case 'DELETE':
            return 204;

        case 'POST':
            return 201;

        default:
            return 200;
    }
}

function createProxyObject( body, statusCode, handlerContext ) {

    let proxyObject = {};

    proxyObject.statusCode = statusCode;
    proxyObject.headers = utils.clone( handlerContext.headers );

    if( !utils.isString( body ) ) {

        body = JSON.stringify( body );
    }

    proxyObject.body = body;

    return proxyObject;
}

function processResult( result, handlerContext ) {

    result = result || {};

    let body = result.body || result;

    return createProxyObject( body, handlerContext.statusCode, handlerContext );
}

function processError( error, handlerContext ) {

    let statusCode = error.status || error.statusCode || 500;

    let body = {

        type: error.name,
        message: error.message
    };

    return createProxyObject( body, statusCode, handlerContext );
}

class APIHandler {

    constructor( options ) {

        options = options || {};

        this.jwt = new JWTValidator( options.jwt || options.JWT );
        this.methodHandlers = {};
        this.afterFunc = function() {};
    }

    jwt( options ) {

        this.jwt = new JWTValidator( options );

        return this;
    }

    execute( event, context, callback ) {

        try {

            if( identifier.identify( event ) !== 'apigateway' ) {

                throw new Error( 'event does not match expected api gateway lambda proxy schema' );
            }

            let method = event.httpMethod;

            if( !method ) {

                throw new Error( 'missing httpMethod property in event object' );
            }

            let handler = this.methodHandlers[ method ];

            if( !handler ) {

                throw new Error( 'handler not defined for http method: ' + method );
            }

            this.jwt.validate( event );

            let handlerContext = {

                event,
                context,
                statusCode: getStatusCode( method ),
                headers: {}
            };

            handler.execute( event, handlerContext )
                .then(
                    (result) => {

                        let proxyObject = processResult( result, handlerContext );

                        return doFinally( this.afterFunc, handlerContext )
                            .then( () => proxyObject );
                    },
                    ( err ) => {

                        let proxyObject = processError( err, handlerContext );

                        return doFinally( this.afterFunc, handlerContext )
                            .then( () => proxyObject );
                    }
                )
                .then( ( proxyObject ) => callback( null, proxyObject ) );
        }
        catch( err ) {

            callback( err );
        }
    }

    finally( afterFunc ) {

        this.afterFunc = afterFunc;

        return this;
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
