'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const sinon = require( 'sinon' );

const LambdaTester = require( 'lambda-tester' );

const MODULE_PATH = 'lib/vandium';

const Vandium = require( '../../' + MODULE_PATH );

const envRestorer = require( 'env-restorer' );

const plugins = require( '../../lib/plugins' );

const ExecPlugin = require( '../../lib/plugins/exec' );

const LambdaProxy = require( '../../lib/lambda_proxy' );

//require( '../lib/logger' ).setLevel( 'debug' );

describe( MODULE_PATH, function() {

    beforeEach( function() {

        envRestorer.restore();
    });

    after( function() {

        envRestorer.restore();
    });

    describe( 'Vandium', function() {

        describe( 'constructor', function() {

            it( 'no configuration', function() {

                let vandium = new Vandium();

                expect( vandium.constructor.name ).to.equal( 'Vandium' );

                expect( vandium.stripErrors ).to.be.true;
                expect( vandium.logUncaughtExceptions ).to.be.true;
                expect( vandium.postHandler ).to.be.a( 'Function' );

                expect( vandium.plugins ).to.exist;

                expect( vandium.jwt ).to.to.exist;
                expect( vandium.jwt.state.enabled ).to.be.false;

                expect( vandium.validation ).to.to.exist;
                expect( vandium.validation.state.enabled ).to.be.false;

                expect( vandium.protect ).to.to.exist;
                expect( vandium.protect.state ).to.eql( { sql: { enabled: true, mode: 'report' } } );
            });

            it( 'with empty configuration', function() {

                let vandium = new Vandium( {} );

                expect( vandium.constructor.name ).to.equal( 'Vandium' );

                expect( vandium.stripErrors ).to.be.true;
                expect( vandium.logUncaughtExceptions ).to.be.true;
                expect( vandium.postHandler ).to.be.a( 'Function' );

                expect( vandium.plugins ).to.exist;

                expect( vandium.jwt ).to.to.exist;
                expect( vandium.jwt.state.enabled ).to.be.false;

                expect( vandium.validation ).to.to.exist;
                expect( vandium.validation.state.enabled ).to.be.false;

                expect( vandium.protect ).to.to.exist;
                expect( vandium.protect.state ).to.eql( { sql: { enabled: true, mode: 'report' } } );
            });

            it( 'with configuration', function() {

                let config = {

                    validation: {

                        schema: {

                            name: 'string:min=1,max=60,trim,required',
                        },

                        ignore: [ 'age' ]
                    },

                    jwt: {

                        algorithm: 'HS256',
                        secret: 'my-secret'
                    },

                    protect: {

                        mode: 'fail'
                    },

                    env: {

                        LIFE_THE_UNIVERSE_AND_EVERYTHING: '42'
                    },

                    logUncaughtExceptions: false,

                    stripErrors: 'no'
                };

                expect( process.env.LIFE_THE_UNIVERSE_AND_EVERYTHING ).to.not.exist;

                let vandium = new Vandium( config );

                expect( vandium.constructor.name ).to.equal( 'Vandium' );

                expect( vandium.stripErrors ).to.be.false;
                expect( vandium.logUncaughtExceptions ).to.be.false;

                expect( vandium.postHandler ).to.be.a( 'Function' );

                expect( vandium.plugins ).to.exist;

                expect( vandium.jwt ).to.to.exist;
                expect( vandium.jwt.state ).to.eql( {

                        enabled: true,
                        key: 'my-secret',
                        algorithm: 'HS256',
                        tokenName: 'jwt',
                        xsrf: false
                    });

                expect( vandium.validation ).to.to.exist;
                expect( vandium.validation.state ).to.eql( { enabled: true, keys: [ 'name' ], ignored: [ 'age' ] } );

                expect( vandium.protect ).to.to.exist;
                expect( vandium.protect.state ).to.eql( { sql: { enabled: true, mode: 'fail' } } );

                expect( process.env.LIFE_THE_UNIVERSE_AND_EVERYTHING ).to.equal( '42' );
            });
        });

        describe( '.validation', function() {

            it( 'normal operation', function() {

                let vandium = new Vandium();

                expect( vandium.validation ).to.equal( vandium.plugins.validation );
                expect( vandium.validation.constructor.name ).to.equal( 'ValidationPlugin' );
            });
        });

        describe( '.jwt', function() {

            it( 'normal operation', function() {

                let vandium = new Vandium();

                expect( vandium.jwt ).to.equal( vandium.plugins.jwt );
                expect( vandium.jwt.constructor.name ).to.equal( 'JWTPlugin' );
            });
        });

        describe( '.protect', function() {

            it( 'normal operation', function() {

                let vandium = new Vandium();

                expect( vandium.protect ).to.equal( vandium.plugins.protect );
                expect( vandium.protect.constructor.name ).to.equal( 'ProtectPlugin' );
            });
        });

        describe( '.configure', function() {

            it( 'without configuration', function() {

                let vandium = new Vandium();

                vandium.configure();

                expect( vandium.stripErrors ).to.be.true;
                expect( vandium.logUncaughtExceptions ).to.be.true;
                expect( vandium.stringifyErrors ).to.be.false;
                expect( vandium.postHandler ).to.be.a( 'Function' );

                expect( vandium.plugins ).to.exist;

                expect( vandium.jwt ).to.to.exist;
                expect( vandium.jwt.state.enabled ).to.be.false;

                expect( vandium.validation ).to.to.exist;
                expect( vandium.validation.state.enabled ).to.be.false;

                expect( vandium.protect ).to.to.exist;
                expect( vandium.protect.state ).to.eql( { sql: { enabled: true, mode: 'report' } } );
            });

            it( 'with empty configuration', function() {

                let vandium = new Vandium();

                vandium.configure( {} );

                expect( vandium.stripErrors ).to.be.true;
                expect( vandium.logUncaughtExceptions ).to.be.true;
                expect( vandium.stringifyErrors ).to.be.false;
                expect( vandium.postHandler ).to.be.a( 'Function' );

                expect( vandium.plugins ).to.exist;

                expect( vandium.jwt ).to.to.exist;
                expect( vandium.jwt.state.enabled ).to.be.false;

                expect( vandium.validation ).to.to.exist;
                expect( vandium.validation.state.enabled ).to.be.false;

                expect( vandium.protect ).to.to.exist;
                expect( vandium.protect.state ).to.eql( { sql: { enabled: true, mode: 'report' } } );
            });

            it( 'with valid configuration', function() {

                expect( process.env.LIFE_THE_UNIVERSE_AND_EVERYTHING ).to.not.exist;

                let vandium = new Vandium();

                let config = {

                    validation: {

                        schema: {

                            name: 'string:min=1,max=60,trim,required',
                        },

                        ignore: [ 'age' ]
                    },

                    jwt: {

                        algorithm: 'HS256',
                        secret: 'my-secret'
                    },

                    protect: {

                        mode: 'fail'
                    },

                    env: {

                        LIFE_THE_UNIVERSE_AND_EVERYTHING: '42'
                    },

                    logUncaughtExceptions: false,

                    stripErrors: 'no',

                    stringifyErrors: true,
                };

                vandium.configure( config );

                expect( vandium.stripErrors ).to.be.false;
                expect( vandium.logUncaughtExceptions ).to.be.false;
                expect( vandium.stringifyErrors ).to.be.true;

                expect( vandium.postHandler ).to.be.a( 'Function' );

                expect( vandium.plugins ).to.exist;

                expect( vandium.jwt ).to.to.exist;
                expect( vandium.jwt.state ).to.eql( {

                        enabled: true,
                        key: 'my-secret',
                        algorithm: 'HS256',
                        tokenName: 'jwt',
                        xsrf: false
                    });

                expect( vandium.validation ).to.to.exist;
                expect( vandium.validation.state ).to.eql( { enabled: true, keys: [ 'name' ], ignored: [ 'age' ] } );

                expect( vandium.protect ).to.to.exist;
                expect( vandium.protect.state ).to.eql( { sql: { enabled: true, mode: 'fail' } } );

                expect( process.env.LIFE_THE_UNIVERSE_AND_EVERYTHING ).to.equal( '42' );
            });

            it( 'with valid configuration followed by empty configuration', function() {

                expect( process.env.LIFE_THE_UNIVERSE_AND_EVERYTHING ).to.not.exist;

                let vandium = new Vandium();

                let config = {

                    validation: {

                        schema: {

                            name: 'string:min=1,max=60,trim,required',
                        },

                        ignore: [ 'age' ]
                    },

                    jwt: {

                        algorithm: 'HS256',
                        secret: 'my-secret'
                    },

                    protect: {

                        mode: 'fail'
                    },

                    env: {

                        LIFE_THE_UNIVERSE_AND_EVERYTHING: '42'
                    },

                    logUncaughtExceptions: false,

                    stripErrors: 'no',

                    stringifyErrors: false
                };

                vandium.configure( config );

                expect( vandium.stripErrors ).to.be.false;
                expect( vandium.logUncaughtExceptions ).to.be.false;
                expect( vandium.stringifyErrors ).to.be.false;

                expect( vandium.postHandler ).to.be.a( 'Function' );

                expect( vandium.plugins ).to.exist;

                expect( vandium.jwt ).to.to.exist;
                expect( vandium.jwt.state ).to.eql( {

                        enabled: true,
                        key: 'my-secret',
                        algorithm: 'HS256',
                        tokenName: 'jwt',
                        xsrf: false
                    });

                expect( vandium.validation ).to.to.exist;
                expect( vandium.validation.state ).to.eql( { enabled: true, keys: [ 'name' ], ignored: [ 'age' ] } );

                expect( vandium.protect ).to.to.exist;
                expect( vandium.protect.state ).to.eql( { sql: { enabled: true, mode: 'fail' } } );

                expect( process.env.LIFE_THE_UNIVERSE_AND_EVERYTHING ).to.equal( '42' );

                // restore
                vandium.configure( {

                    env: {

                        LIFE_THE_UNIVERSE_AND_EVERYTHING: 'forty-two'
                    }
                });

                expect( vandium.stripErrors ).to.be.true;
                expect( vandium.logUncaughtExceptions ).to.be.true;
                expect( vandium.postHandler ).to.be.a( 'Function' );

                expect( vandium.plugins ).to.exist;

                expect( vandium.jwt ).to.to.exist;
                expect( vandium.jwt.state.enabled ).to.be.false;

                expect( vandium.validation ).to.to.exist;
                expect( vandium.validation.state.enabled ).to.be.false;

                expect( vandium.protect ).to.to.exist;
                expect( vandium.protect.state ).to.eql( { sql: { enabled: true, mode: 'report' } } );

                // should still be set to the original value
                expect( process.env.LIFE_THE_UNIVERSE_AND_EVERYTHING ).to.equal( '42' );
            });
        });

        describe( '.getConfiguration', function() {

            it( 'unconfigured', function() {

                let vandium = new Vandium();

                let config = vandium.getConfiguration();

                expect( config ).to.eql( {

                    stripErrors: true,
                    logUncaughtExceptions: true,
                    stringifyErrors: false,
                    validation: {},
                    callbackWaitsForEmptyEventLoop: true,
                    jwt: { enable: false },
                    protect: { mode: 'report' }
                });
            });

            it( 'configured', function() {

                let vandium = new Vandium( {

                    validation: {

                        schema: {

                            name: 'string:required'
                        }
                    },

                    protect: {

                        mode: 'fail'
                    },

                    jwt: {

                        algorithm: 'HS256',
                        secret: 'super-secret'
                    },

                    callbackWaitsForEmptyEventLoop: false
                });

                let config = vandium.getConfiguration();

                expect( config.validation.schema ).to.exist;
                expect( config.validation.schema.name ).to.exist;
                expect( config.validation.allowUnknown ).to.be.true;
                expect( config.validation.ignore ).to.eql( [] );

                expect( config.protect ).to.eql( { mode: 'fail' } );

                expect( config.jwt ).to.eql( {

                    enable: true,
                    algorithm: 'HS256',
                    secret: 'super-secret'
                });

                expect( config.callbackWaitsForEmptyEventLoop ).to.be.false;

                expect( config.stripErrors ).to.be.true;
                expect( config.logUncaughtExceptions ).to.be.true;
                expect( config.stringifyErrors ).to.be.false;
            });
        });

        describe( '.after', function() {

            it( '.normal operation', function() {

                let myFunction = function() {};

                let vandium = new Vandium();

                expect( vandium.postHandler ).to.exist;

                vandium.after( myFunction );
                expect( vandium.postHandler ).to.equal( myFunction );

                // wipe out configuration - post handler should still be set
                vandium.configure( {} );
                expect( vandium.postHandler ).to.equal( myFunction );

                // ignore non-functions
                vandium.after();
                expect( vandium.postHandler ).to.equal( myFunction );

                // replace
                vandium.after( function() {} );
                expect( vandium.postHandler ).to.not.equal( myFunction );
            });
        });

        describe( '.handler', function() {

            beforeEach( function() {

                sinon.spy( console, 'log' );
            });

            afterEach( function() {

                console.log.restore();
            })

            it( 'standard lambda handler with success', function( done ) {

                let vandium = new Vandium();

                let handler = vandium.handler( function() {

                    return Promise.resolve( 'ok' );
                });

                expect( handler ).to.exist;
                expect( handler.length ).to.equal( 3 );

                let context = {};


                handler( {}, context, function( err, result ) {

                    expect( result ).to.equal( 'ok' );
                    expect( context.callbackWaitsForEmptyEventLoop ).to.not.exist;

                    done();
                });
            });

            it( 'prevent double wrapping', function() {

                let vandium = new Vandium();

                let handler = vandium.handler( function() {

                    return Promise.resolve( 'ok' );
                });

                expect( handler.__isVandium ).to.be.true;
                expect( handler ).to.be.a( 'function' );

                // should be same instance
                let handler2 = vandium.handler( handler );
                expect( handler2 ).to.equal( handler );
            });

            it( 'standard lambda handler with success, callbackWaitsForEmptyEventLoop = false', function( done ) {

                let vandium = new Vandium();

                let handler = vandium.handler( function( event, context ) {

                    context.callbackWaitsForEmptyEventLoop = false;
                    return Promise.resolve( 'ok' );
                });

                expect( handler ).to.exist;
                expect( handler.length ).to.equal( 3 );

                let lambdaContext = {};

                handler( {}, lambdaContext, function( err, result ) {

                    expect( result ).to.equal( 'ok' );
                    expect( lambdaContext.callbackWaitsForEmptyEventLoop === false ).to.be.true;
                    done();
                });
            });

            it( 'standard lambda handler with success, callbackWaitsForEmptyEventLoop = true', function( done ) {

                let vandium = new Vandium();

                let handler = vandium.handler( function( event, context ) {

                    context.callbackWaitsForEmptyEventLoop = true;
                    return Promise.resolve( 'ok' );
                });

                expect( handler ).to.exist;
                expect( handler.length ).to.equal( 3 );

                let lambdaContext = {};

                handler( {}, lambdaContext, function( err, result ) {

                    expect( result ).to.equal( 'ok' );
                    expect( lambdaContext.callbackWaitsForEmptyEventLoop ).to.not.exist;
                    done();
                });
            });

            it( 'standard lambda handler with success, config.callbackWaitsForEmptyEventLoop = false', function( done ) {

                let vandium = new Vandium( { callbackWaitsForEmptyEventLoop: false } );

                let handler = vandium.handler( function( event ) {

                    return Promise.resolve( 'ok' );
                });

                expect( handler ).to.exist;
                expect( handler.length ).to.equal( 3 );

                let lambdaContext = {};

                handler( {}, lambdaContext, function( err, result ) {

                    expect( result ).to.equal( 'ok' );
                    expect( lambdaContext.callbackWaitsForEmptyEventLoop ).to.exist;
                    expect( lambdaContext.callbackWaitsForEmptyEventLoop ).to.be.false;
                    done();
                });
            });

            it( 'standard lambda handler with failure, stripErrors = true', function( done ) {

                let vandium = new Vandium();

                let handler = vandium.handler( function() {

                    return Promise.reject( new Error( 'bang') );
                });

                expect( handler ).to.exist;
                expect( handler.length ).to.equal( 3 );

                handler( {}, {}, function( err, result ) {

                    expect( err ).to.exist;
                    expect( err.message ).to.equal( 'bang' );
                    expect( err.stack.length ).to.equal( 0 );

                    expect( result ).to.not.exist;

                    done();
                });
            });

            it( 'standard lambda handler with failure, stringifyErrors = true, stripErrors = true', function( done ) {

                let vandium = new Vandium( { stringifyErrors: true } );

                let handler = vandium.handler( function() {

                    return Promise.reject( new Error( 'bang') );
                });

                expect( handler ).to.exist;
                expect( handler.length ).to.equal( 3 );

                handler( {}, {}, function( err, result ) {

                    try {

                        expect( err ).to.exist;
                        expect( err ).to.be.a( 'string' );

                        err = JSON.parse( err );

                        expect( err.errorMessage ).to.equal( 'bang' );
                        expect( err.errorType ).to.equal( 'Error' );
                        expect( err.stackTrace ).to.exist;

                        expect( result ).to.not.exist;

                        done();
                    }
                    catch( error ) {

                        done( error );
                    }
                });
            });

            it( 'standard lambda handler with failure, stringifyErrors = true, Typed error, stringifyErrors = true', function( done ) {

                let vandium = new Vandium( { stringifyErrors: true } );

                let handler = vandium.handler( function() {

                    class MyError extends Error {

                        constructor( msg, status ) {

                            super( msg );

                            this.name = 'MyError';
                            this.status = status;
                        }
                    }

                    return Promise.reject( new MyError( 'bang', 404 ) );
                });

                expect( handler ).to.exist;
                expect( handler.length ).to.equal( 3 );

                handler( {}, {}, function( err, result ) {

                    try {

                        expect( err ).to.exist;
                        expect( err ).to.be.a( 'string' );

                        err = JSON.parse( err );

                        expect( err.errorMessage ).to.equal( 'bang' );
                        expect( err.status ).to.equal( 404 );
                        expect( err.errorType ).to.equal( 'MyError' );
                        expect( err.stackTrace ).to.exist;
                        expect( err.stackTrace.length === 0 ).to.be.true;

                        expect( result ).to.not.exist;

                        done();
                    }
                    catch( error ) {

                        done( error );
                    }
                });
            });

            it( 'standard lambda handler with failure, stringifyErrors = true, Typed error, stringifyErrors = false', function( done ) {

                let vandium = new Vandium( { stringifyErrors: true, stripErrors: false} );

                let handler = vandium.handler( function() {

                    class MyError extends Error {

                        constructor( msg, code ) {

                            super( msg );

                            this.name = 'MyError';
                            this.code = code;
                        }
                    }

                    return Promise.reject( new MyError( 'bang', 42 ) );
                });

                expect( handler ).to.exist;
                expect( handler.length ).to.equal( 3 );

                handler( {}, {}, function( err, result ) {

                    try {

                        expect( err ).to.exist;
                        expect( err ).to.be.a( 'string' );

                        err = JSON.parse( err );

                        expect( err.errorMessage ).to.equal( 'bang' );
                        expect( err.code ).to.equal( 42 );
                        expect( err.errorType ).to.equal( 'MyError' );
                        expect( err.stackTrace ).to.exist;
                        expect( err.stackTrace.length > 0 ).to.be.true;
                        expect( result ).to.not.exist;

                        done();
                    }
                    catch( error ) {

                        done( error );
                    }
                });
            });

            it( 'standard lambda handler with failure, stringifyErrors = true, Error with no message', function( done ) {

                let vandium = new Vandium( { stringifyErrors: true } );

                let handler = vandium.handler( function() {

                    class MyError extends Error {

                        constructor() {

                            super();

                            this.name = 'MyError';
                        }
                    }

                    return Promise.reject( new MyError() );
                });

                expect( handler ).to.exist;
                expect( handler.length ).to.equal( 3 );

                handler( {}, {}, function( err, result ) {

                    expect( err ).to.exist;
                    expect( err ).to.be.a( 'string' );

                    err = JSON.parse( err );

                    expect( err.errorMessage ).to.equal( 'MyError' );
                    expect( err.errorType ).to.equal( 'MyError' );
                    expect( err.stackTrace ).to.exist;

                    expect( result ).to.not.exist;

                    done();
                });
            });

            it( 'standard lambda handler with failure, stringifyErrors = true, Object error (not using Error constructor)', function( done ) {

                let vandium = new Vandium( { stringifyErrors: true } );

                let handler = vandium.handler( function() {

                    return Promise.reject( { message: 'bang' } );
                });

                expect( handler ).to.exist;
                expect( handler.length ).to.equal( 3 );

                handler( {}, {}, function( err, result ) {

                    try {

                        expect( err ).to.exist;
                        expect( err ).to.be.a( 'string' );

                        err = JSON.parse( err );

                        expect( err.errorMessage ).to.equal( 'bang' );
                        expect( err.errorType ).to.equal( 'Error' );
                        expect( err.stackTrace ).to.not.exist;

                        expect( result ).to.not.exist;

                        done();
                    }
                    catch( error ) {

                        done( error );
                    }
                });
            });

            it( 'standard lambda handler with failure, stringifyErrors = true, String error', function( done ) {

                let vandium = new Vandium( { stringifyErrors: true } );

                let handler = vandium.handler( function( event, context, callback ) {

                    callback( 'something went wrong' );
                });

                expect( handler ).to.exist;
                expect( handler.length ).to.equal( 3 );

                handler( {}, {}, function( err, result ) {

                    try {

                        expect( err ).to.equal( 'something went wrong' );
                        expect( result ).to.not.exist;

                        done();
                    }
                    catch( error ) {

                        done( error );
                    }
                });
            });


            it( 'standard lambda handler with failure, stripErrors = false', function( done ) {

                let vandium = new Vandium( {

                    stripErrors: false
                });

                let handler = vandium.handler( function() {

                    return Promise.reject( new Error( 'bang') );
                });

                expect( handler ).to.exist;
                expect( handler.length ).to.equal( 3 );

                handler( {}, {}, function( err, result ) {

                    expect( err ).to.exist;
                    expect( err.message ).to.equal( 'bang' );
                    expect( err.stack.length > 0 ).to.be.true;

                    expect( result ).to.not.exist;

                    done();
                });
            });

            it( 'standard lambda handler, post handler returns promise', function( done ) {

                let vandium = new Vandium();

                vandium.after( function() { return Promise.resolve(); } );

                let handler = vandium.handler( function() {

                    return Promise.resolve( 'ok' );
                });

                expect( handler ).to.exist;
                expect( handler.length ).to.equal( 3 );

                handler( {}, {}, function( err, result ) {

                    expect( result ).to.equal( 'ok' );
                    done();
                });
            });

            it( 'standard lambda handler, post handler with callback error', function( done ) {

                let vandium = new Vandium();

                vandium.after( function( callback ) { callback( new Error( 'error here!' ) ); } );

                let handler = vandium.handler( function() {

                    return Promise.resolve( 'ok' );
                });

                expect( handler ).to.exist;
                expect( handler.length ).to.equal( 3 );

                handler( {}, {}, function( err, result ) {

                    expect( result ).to.equal( 'ok' );
                    done();
                });
            });

            it( 'standard lambda handler, sync post handler throwing error', function( done ) {

                let vandium = new Vandium();

                vandium.after( function() { throw new Error( 'error here!' ); } );

                let handler = vandium.handler( function() {

                    return Promise.resolve( 'ok' );
                });

                expect( handler ).to.exist;
                expect( handler.length ).to.equal( 3 );

                handler( {}, {}, function( err, result ) {

                    expect( result ).to.equal( 'ok' );
                    done();
                });
            });

            it( 'Using default lambda proxy - success case, httpMethod = GET', function( done ) {

                let vandium = new Vandium( { lambdaProxy: true } );

                let handler = vandium.handler( function() {

                    return Promise.resolve( { ok: true } );
                });

                handler( { httpMethod: 'GET' }, {}, function( err, result ) {

                    try {

                        expect( err ).to.not.exist;
                        expect( result ).to.exist;

                        expect( result ).to.eql( {

                            statusCode: 200,
                            headers: {},
                            body: '{"ok":true}'
                        });

                        done();
                    }
                    catch( err ) {

                        console.log( err );

                        done( err );
                    }
                });
            });

            it( 'Using default lambda proxy - success case, httpMethod = POST', function( done ) {

                let vandium = new Vandium( { lambdaProxy: true } );

                let handler = vandium.handler( function() {

                    return Promise.resolve( { ok: true } );
                });

                handler( { httpMethod: 'POST' }, {}, function( err, result ) {

                    expect( err ).to.not.exist;
                    expect( result ).to.exist;

                    expect( result ).to.eql( {

                        statusCode: 201,
                        headers: {},
                        body: '{"ok":true}'
                    });

                    done();
                });
            });

            it( 'Using default lambda proxy - error case, httpMethod = GET', function( done ) {

                let vandium = new Vandium( { lambdaProxy: true } );

                let handler = vandium.handler( function() {

                    let error = new Error( 'not found' );
                    error.status = 404;

                    return Promise.reject( error );
                });

                handler( { httpMethod: 'GET' }, {}, function( err, result ) {

                    expect( err ).to.not.exist;
                    expect( result ).to.exist;

                    expect( result ).to.eql( {

                        statusCode: 404,
                        headers: {},
                        body: '{"type":"Error","message":"not found"}'
                    });

                    done();
                });
            });

            it( 'Using lambda proxy - error case while generating response', function( done ) {

                let myProxy = new LambdaProxy();

                myProxy.onResult = function() {

                    throw new Error( 'bang' );
                }

                let vandium = new Vandium( { lambdaProxy: myProxy } );

                let handler = vandium.handler( function() {

                    return Promise.resolve( { ok: 42 } );
                });


                handler( { httpMethod: 'GET' }, {}, function( err, result ) {

                    expect( err ).to.not.exist;
                    expect( result ).to.exist;

                    expect( console.log.calledOnce ).to.be.true;
                    expect( console.log.firstCall.args[0] ).contains( 'error while processing callback' );

                    // should return original unproxied value
                    expect( result ).to.eql( { ok: 42 } );

                    done();
                });
            });

            // must be last test in this describe()
            //
            it( 'fail to run pipeline', function( done ) {

                class MyExecPlugin extends plugins.ExecPlugin {

                    constructor() {

                        super();
                    }

                    execute() {

                        throw new Error( 'bang' );
                    }
                }

                let vandium = new Vandium();

                // replace exec plugin - will get restored after
                plugins.ExecPlugin = MyExecPlugin;

                let handler = vandium.handler( function() {

                    return Promise.resolve( 'ok' );
                });

                expect( handler ).to.exist;
                expect( handler.length ).to.equal( 3 );

                handler( {}, {}, function( err, result ) {

                    expect( err ).to.exist;
                    expect( err.message ).to.equal( 'bang' );

                    expect( result ).to.not.exist;

                    done();
                });
            });

            after( function() {

                plugins.ExecPlugin = ExecPlugin;
            });
        });
    });

    describe( 'handler invocations', function() {

        describe( 'basic', function() {

            describe( 'no configuration, success using:', function() {

                [
                    [
                         'context.succeed()',
                         function( event, context ) {

                             // should route to callback( null, 'ok' );
                             context.succeed( 'ok' )
                         }
                    ],
                    [
                        'context.done( null, result )',
                        function( event, context ) {

                            // should route to callback( null, 'ok' );
                            context.done( null, 'ok' );
                        }
                    ],
                    [
                        'callback( null, result )',
                        function( event, context, callback ) {

                            callback( null, 'ok' );
                        }
                    ],
                    [
                        'Promise.resolve()',
                        function() {

                            return Promise.resolve( 'ok' );
                        }
                    ]

                ].forEach( function( test ) {

                    it( test[0], function() {

                        const vandium = new Vandium();

                        const handler = vandium.handler( test[1] );

                        return LambdaTester( handler )
                            .expectResult( function( result ) {

                                expect( result ).to.equal( 'ok' );
                            });
                    });
                });
            });

            describe( 'no configuration, fail using:', function() {

                [
                    [
                         'context.fail()',
                         function( event, context ) {

                             // should route to callback( err );
                             context.fail( new Error( 'bang' ) );
                         }
                    ],
                    [
                        'context.done( err )',
                        function( event, context ) {

                            // should route to callback( err );
                            context.done( new Error( 'bang' ) );
                        }
                    ],
                    [
                        'callback( err )',
                        function( event, context, callback ) {

                            // should route to callback( err );
                            callback( new Error( 'bang' ) );
                        }
                    ],
                    [
                        'Promise.reject()',
                        function() {

                            return Promise.reject( new Error( 'bang' ) );
                        }
                    ]

                ].forEach( function( test ) {

                    it( test[0], function() {

                        const vandium = new Vandium();

                        const handler = vandium.handler( test[1] );

                        return LambdaTester( handler )
                            .expectError( function( err ) {

                                expect( err.message ).to.equal( 'bang' );
                            });
                    });
                });
            });
        });
    });
});
