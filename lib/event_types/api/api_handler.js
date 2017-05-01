'use strict';

const cookie = require( 'cookie' );

const utils = require( '../../utils' );

const MethodHandler = require( './method' );

const JWTValidator = require( './jwt' );

const Protection = require( './protection' );

const constants = require( './constants' );

const TypedHandler = require( '../typed' );

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

function createProxyObject( body, statusCode, headers ) {

    let proxyObject = {};

    proxyObject.statusCode = statusCode;
    proxyObject.headers = headers;

    if( !utils.isString( body ) ) {

        body = JSON.stringify( body );
    }

    proxyObject.body = body;

    return proxyObject;
}

function processCookies( event ) {

    if( event.headers && event.headers.Cookie) {

        try {

            return cookie.parse( event.headers.Cookie );
        }
        catch( err ) {

            console.log( 'cannot process cookies', err );
        }
    }

    return {};
}

function defaultOnError( err ) {

    return err;
}

class APIHandler extends TypedHandler {

    constructor( options = {} ) {

        super( 'apigateway', options );

        this._jwt = new JWTValidator( options.jwt );
        this._headers = {};
        this._protection = new Protection( options.protection );
        this.methodHandlers = {};
        this._onErrorHandler = defaultOnError;
        this.afterFunc = function() {};
    }

    jwt( options ) {

        this._jwt = new JWTValidator( options );

        return this;
    }

    headers( options ) {

        this._headers = utils.clone( options );

        return this;
    }

    protection( options ) {

        this._protection = new Protection( options );

        return this;
    }

    onError( onErrorHandler ) {

        this._onErrorHandler = onErrorHandler;

        return this;
    }

    addMethodsToHandler( lambdaHandler ) {

        super.addMethodsToHandler( lambdaHandler );

        this.addlambdaHandlerMethod( 'jwt', lambdaHandler );
        this.addlambdaHandlerMethod( 'headers', lambdaHandler );
        this.addlambdaHandlerMethod( 'protection', lambdaHandler );
        this.addlambdaHandlerMethod( 'onError', lambdaHandler );

        constants.HTTP_METHODS.forEach( (methodType) => {

            this.addlambdaHandlerMethod( methodType, lambdaHandler );
            this.addlambdaHandlerMethod( methodType.toLowerCase(), lambdaHandler );
        });
    }

    executePreprocessors( state ) {

        super.executePreprocessors( state );

        let event = state.event;

        let method = event.httpMethod;

        let methodHandler = this.methodHandlers[ method ];

        if( !methodHandler ) {

            throw new Error( 'handler not defined for http method: ' + method );
        }

        this._protection.validate( event );

        event.cookies = processCookies( event );

        this._jwt.validate( event );

        methodHandler.validate( event );

        state.executor = methodHandler.executor;
    }

    processResult( result, context ) {

        result = result || {};

        let statusCode = result.statusCode || getStatusCode( context.event.httpMethod );
        let headers = utils.clone( result.headers || this._headers );

        let body = result.body || result;

        return { result: createProxyObject( body, statusCode, headers ) };
    }

    processError( error ) {

        let updatedError = this._onErrorHandler( error );

        if( updatedError ) {

            error = updatedError;
        }

        let statusCode = error.status || error.statusCode || 500;
        let headers = utils.clone( error.headers || this._headers );

        let body = {

            type: error.name,
            message: error.message
        };

        return { result: createProxyObject( body, statusCode, headers ) };
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
