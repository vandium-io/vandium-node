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

function createProxyObject( body, statusCode, headers, isBase64Encoded = false ) {

    let proxyObject = {};

    proxyObject.statusCode = statusCode;
    proxyObject.headers = headers;

    if( body ) {

        if( Buffer.isBuffer( body ) ) {

            body = body.toString( 'base64' );
            isBase64Encoded = true;
        }
        else if( !utils.isString( body ) ) {

            body = JSON.stringify( body );
        }
    }

    proxyObject.body = body;
    proxyObject.isBase64Encoded = isBase64Encoded || false;

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

function headerListValue( value ) {

    if( Array.isArray( value ) ) {

        value = value.join( ', ' );
    }

    return value;
}

function processBody( value ) {

    if( utils.isString( value ) ) {

        try {

            return JSON.parse( value );
        }
        catch( err ) {

            // ignore
        }
    }

    // keep original value
    return value;
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

    jwt( options = {} ) {

        this._jwt = new JWTValidator( options );

        return this;
    }

    headers( options = {} ) {

        for( let key in options ) {

            this.header( key, options[ key ] );
        }

        return this;
    }

    header( name, value ) {

        if( name && (value !== undefined && value !== null) ) {

            this._headers[ name ] = value.toString();
        }

        return this;
    }

    protection( options ) {

        this._protection = new Protection( options );

        return this;
    }

    cors( options = {} ) {

        this.header( 'Access-Control-Allow-Origin', options.allowOrigin );
        this.header( 'Access-Control-Allow-Credentials', options.allowCredentials );
        this.header( 'Access-Control-Expose-Headers', headerListValue( options.exposeHeaders ) );
        this.header( 'Access-Control-Max-Age', options.maxAge );
        this.header( 'Access-Control-Allow-Headers', headerListValue( options.allowHeaders ) );

        return this;
    }

    onError( onErrorHandler ) {

        this._onErrorHandler = onErrorHandler;

        return this;
    }

    addMethodsToHandler( lambdaHandler ) {

        super.addMethodsToHandler( lambdaHandler );

        this.addlambdaHandlerMethod( 'jwt', lambdaHandler );
        this.addlambdaHandlerMethod( 'header', lambdaHandler );
        this.addlambdaHandlerMethod( 'headers', lambdaHandler );
        this.addlambdaHandlerMethod( 'protection', lambdaHandler );
        this.addlambdaHandlerMethod( 'cors', lambdaHandler );
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

        if( !event.queryStringParameters ) {

            event.queryStringParameters = {};
        }

        if( !event.pathParameters ) {

            event.pathParameters = {};
        }

        if( event.body ) {

            event.rawBody = event.body;

            event.body = processBody( event.body );
        }

        this._protection.validate( event );

        event.cookies = processCookies( event );

        this._jwt.validate( event );

        methodHandler.validate( event );

        state.executor = methodHandler.executor;
    }

    processResult( result, context ) {

        let body = result;

        result = result || {};

        if( result.body ) {

            body = result.body;
        }

        let statusCode = result.statusCode || getStatusCode( context.event.httpMethod );
        let headers = utils.clone( result.headers || this._headers );
        let isBase64Encoded = result.isBase64Encoded;

        return { result: createProxyObject( body, statusCode, headers, isBase64Encoded ) };
    }

    processError( error, context ) {

        let updatedError = this._onErrorHandler( error, context.event, context );

        if( updatedError ) {

            error = updatedError;
        }

        let statusCode = error.status || error.statusCode || 500;
        let headers = utils.clone( error.headers || this._headers );

        let body = error.body || {

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
