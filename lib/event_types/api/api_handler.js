const MethodHandler = require( './method' );

const JWTValidator = require( './jwt' );

const Protection = require( './protection' );

const constants = require( './constants' );

const TypedHandler = require( '../typed' );

const responseProcessor = require( './response' );

const { processCookies } = require( './cookies' );

const { processBody } = require( './body' );

const { processHeaderValue } = require( './helper' );

const { isFunction } = require( '../../utils' );

const { types } = require( '../../validation' );

class APIHandler extends TypedHandler {

    constructor( options = {} ) {

        super( 'apigateway', options );

        this._jwt = new JWTValidator( options.jwt );
        this._bodyEncoding = (options.bodyEncoding || 'auto').toLowerCase();
        this._headers = {};
        this._protection = new Protection( options.protection );
        this.methodHandlers = {};
        this._onErrorHandler = (err) => err;
        this.afterFunc = function() {};
    }

    jwt( options = {} ) {

        this._jwt = new JWTValidator( options );

        return this;
    }

    formURLEncoded( enabled = true ) {

        this._bodyEncoding = enabled ? 'formURLEncoded' : 'auto';

        return this;
    }

    skipBodyParse() {

        this._bodyEncoding = 'none';

        return this;
    }

    headers( values = {} ) {

        for( let name in values ) {

            this.header( name, values[ name ] );
        }

        return this;
    }

    header( name, value ) {

        processHeaderValue( this._headers, name, value );

        return this;
    }

    protection( options ) {

        this._protection = new Protection( options );

        return this;
    }

    cors( options = {} ) {

        const headerListValue = ( value ) => {

            if( Array.isArray( value ) ) {

                value = value.join( ', ' );
            }

            return value;
        };

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

    validation( functionOrOptions ) {

        let options = functionOrOptions;

        if( isFunction( functionOrOptions ) ) {

            options = functionOrOptions( types );
        }

        this.currentMethodHandler.setValidation( options );

        return this;
    }

    handler( handler ) {

        this.currentMethodHandler.setHandler( handler );

        return this;
    }

    onResponse( onResponseHandler ) {

        this.currentMethodHandler.setOnResponse( onResponseHandler );

        return this;
    }

    addMethodsToHandler( lambdaHandler ) {

        super.addMethodsToHandler( lambdaHandler );

        this.addlambdaHandlerMethod( 'jwt', lambdaHandler );
        this.addlambdaHandlerMethod( 'formURLEncoded', lambdaHandler );
        this.addlambdaHandlerMethod( 'header', lambdaHandler );
        this.addlambdaHandlerMethod( 'headers', lambdaHandler );
        this.addlambdaHandlerMethod( 'protection', lambdaHandler );
        this.addlambdaHandlerMethod( 'cors', lambdaHandler );
        this.addlambdaHandlerMethod( 'onError', lambdaHandler );
        this.addlambdaHandlerMethod( 'onResponse', lambdaHandler );

        this.addlambdaHandlerMethod( 'validation', lambdaHandler );
        this.addlambdaHandlerMethod( 'handler', lambdaHandler );

        constants.HTTP_METHODS.forEach( (methodType) => {

            this.addlambdaHandlerMethod( methodType, lambdaHandler );
            this.addlambdaHandlerMethod( methodType.toLowerCase(), lambdaHandler );
        });
    }

    executePreprocessors( state ) {

        super.executePreprocessors( state );

        let { event } = state;

        let method = event.httpMethod;

        let methodHandler = this.methodHandlers[ method ];

        if( !methodHandler ) {

            throw new Error( 'handler not defined for http method: ' + method );
        }

        state.extra = { method, methodHandler };

        event.queryStringParameters = event.queryStringParameters || {};
        event.multiValueQueryStringParameters = event.multiValueQueryStringParameters || {};

        event.pathParameters = event.pathParameters || {};

        if( event.body ) {

            event.rawBody = event.body;

            event.body = processBody( event.body, this._bodyEncoding );
        }

        this._protection.validate( event );

        event.cookies = processCookies( event.headers );

        this._jwt.validate( event );

        methodHandler.validator.validate( event );

        state.executor = methodHandler.executor;
    }

    async processResult( result, context, { methodHandler } ) {

        const responseObject = responseProcessor.processResult( result, context, this._headers );

        return await this.processResponse( responseObject, methodHandler );
    }

    async processError( error, context, { methodHandler } ) {

        let updatedError = await this._onErrorHandler( error, context.event, context );

        if( updatedError ) {

            error = updatedError;
        }

        const responseObject = responseProcessor.processError( error, this._headers );

        return await this.processResponse( responseObject, methodHandler );
    }

    /**
     * Single conduit to processing responses
     */
    async processResponse( responseObject, methodHandler ) {

        const result = await methodHandler.onResponse( responseObject.result );

        return { result };
    }

    get currentMethodHandler() {

        if( !this._currentMethodHandler ) {

            throw new Error( 'Method not selected' );
        }

        return this._currentMethodHandler;
    }

    _addHandler( type, ...args ) {

        const methodHandler = new MethodHandler();

        if( args.length > 1 ) {

            methodHandler.setValidation( args[ 0 ] );
            methodHandler.setHandler( args[ 1 ] );
        }
        else if( args.length === 1 ) {

            methodHandler.setHandler( args[ 0 ] );
        }

        this.methodHandlers[ type ] = methodHandler;
        this._currentMethodHandler = methodHandler;

        return this;
    }
}

// add http methods to APIHandler class
constants.HTTP_METHODS.forEach( (methodType) => {

    APIHandler.prototype[ methodType ] = function( ...args ) {

        return this._addHandler( methodType, ...args );
    };
});


module.exports = APIHandler;
