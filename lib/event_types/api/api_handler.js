const MethodHandler = require( './method' );

const JWTValidator = require( './jwt' );

const Protection = require( './protection' );

const constants = require( './constants' );

const TypedHandler = require( '../typed' );

const responseProcessor = require( './response' );

const { processCookies } = require( './cookies' );

const { processBody } = require( './body' );

const { processHeaderValue } = require( './helper' );

const { isFunction, parseBoolean } = require( '../../utils' );

const { types } = require( '../../validation' );

const Pipeline = require( '../pipeline' );

const PREPROCESSOR_PIPELINE_STAGES = [

    'methodValidation',
    'eventNormalization',
    'bodyProcessing',
    'protection',
    'cookies',
    'jwt',
    'validation',
    'extractExecutor'
];

class APIHandler extends TypedHandler {

    constructor( options = {} ) {

        super( 'apigateway', options );

        this._initPipeline();

        this.authorization();

        this.bodyEncoding( options.bodyEncoding );

        this._headers = {};

        this.protection( options.protection );

        this.methodHandlers = {};
        this._onErrorHandler = (err) => err;
        this.afterFunc = function() {};
    }

    authorization( authConfig ) {

        return this.jwt( authConfig );
    }

    jwt( options = {} ) {

        const jwt = new JWTValidator( options );

        this.pipeline.stage( 'jwt', ( { event } ) => {

            jwt.validate( event );
        });

        return this;
    }

    formURLEncoded( enabled = true ) {

        return this.bodyEncoding( enabled ? 'formURLEncoded' : 'auto' );
    }

    skipBodyParse() {

        return this.bodyEncoding( 'none' );
    }

    bodyEncoding( encoding = 'auto' ) {

        // switch( encoding ) {
        //
        //     case 'formURLEncoded':
        //     case 'auto':
        //     case 'none':
        //         //this._bodyEncoding = encoding;
        //         break;
        //
        //     default:
        //         throw new Error( `Unsupported body encoding type: ${encoding}` );
        // }

        this.pipeline.stage( 'bodyProcessing', (state) => {

            const { event } = state;

            if( event.body ) {

                event.rawBody = event.body;

                event.body = processBody( event.body, encoding );
            }
        });

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

        [
            'jwt',
            'authorization',
            'formURLEncoded',
            'header',
            'headers',
            'protection',
            'cors',
            'onError',
            'onResponse',
            'validation',
            'handler'

        ].forEach( (handlerMethod) => this.addlambdaHandlerMethod( handlerMethod, lambdaHandler));

        constants.HTTP_METHODS.forEach( (methodType) => {

            this.addlambdaHandlerMethod( methodType, lambdaHandler );
            this.addlambdaHandlerMethod( methodType.toLowerCase(), lambdaHandler );
        });
    }

    executePreprocessors( state ) {

        super.executePreprocessors( state );

        //execute pipeline
        this.pipeline.executorSync().run( state );
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

    _initPipeline() {

        this.pipeline = new Pipeline( PREPROCESSOR_PIPELINE_STAGES );

        this.pipeline.stage( 'methodValidation', (state) => {

            let { event } = state;

            let method = event.httpMethod;

            let methodHandler = this.methodHandlers[ method ];

            if( !methodHandler ) {

                throw new Error( 'handler not defined for http method: ' + method );
            }

            state.extra = { method, methodHandler };
        });

        this.pipeline.stage( 'eventNormalization', ( { event }) => {

            event.queryStringParameters = event.queryStringParameters || {};
            event.multiValueQueryStringParameters = event.multiValueQueryStringParameters || {};

            event.pathParameters = event.pathParameters || {};
        });

        this.pipeline.stage( 'protection', ( { event }) => {

            this._protection.validate( event );
        });

        this.pipeline.stage( 'cookies', ( { event }) => {

            event.cookies = processCookies( event.headers );
        });

        this.pipeline.stage( 'validation', ( { event, extra: { methodHandler } } ) => {

            methodHandler.validator.validate( event );
        });

        this.pipeline.stage( 'extractExecutor', (state) => {

            const { extra: { methodHandler } } = state;

            state.executor = methodHandler.executor;
        });
    }
}

// add http methods to APIHandler class
constants.HTTP_METHODS.forEach( (methodType) => {

    APIHandler.prototype[ methodType ] = function( ...args ) {

        return this._addHandler( methodType, ...args );
    };
});


module.exports = APIHandler;
