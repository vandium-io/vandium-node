'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const sinon = require( 'sinon' );

const zlib = require( 'zlib' );

const proxyquire = require( 'proxyquire' );

const cookie = require( 'cookie' );

const APIHandler = require( '../api_handler' );

describe( 'lib/event_types/api/api_handler', function() {

    describe( 'APIHandler', function() {

        describe( 'constructor', function() {

            it( 'no options', function() {

                let instance = new APIHandler();

                expect( instance._type ).to.equal( 'apigateway' );

                expect( instance._jwt ).to.exist;
                expect( instance._jwt.enabled ).to.be.false;

                expect( instance._headers ).to.eql( {} );

                expect( instance._protection ).to.exist;
                expect( instance._protection.sql.mode ).to.equal( 'report' );

                expect( instance.methodHandlers ).to.eql( {} );
                expect( instance._onErrorHandler ).to.exist;
                expect( instance.afterFunc ).to.exist;
                expect( instance._onErrorHandler ).to.exist;
            });

            it( 'with options', function() {

                let instance = new APIHandler( {

                    jwt: {

                        algorithm: 'HS256',
                        key: 'secret'
                    },
                    protection: {

                        mode: 'fail'
                    }
                });

                expect( instance._type ).to.equal( 'apigateway' );

                expect( instance._jwt ).to.exist;
                expect( instance._jwt.enabled ).to.be.true;
                expect( instance._jwt.algorithm ).to.equal( 'HS256' );
                expect( instance._jwt.key ).to.equal( 'secret' );

                expect( instance._headers ).to.eql( {} );

                expect( instance._protection ).to.exist;
                expect( instance._protection.sql.mode ).to.equal( 'fail' );

                expect( instance.methodHandlers ).to.eql( {} );
                expect( instance._onErrorHandler ).to.exist;
                expect( instance.afterFunc ).to.exist;
                expect( instance._onErrorHandler ).to.exist;
            });
        });

        describe( '.jwt', function() {

            it( 'normal operation', function() {

                let instance = new APIHandler();
                expect( instance._jwt ).to.exist;
                expect( instance._jwt.enabled ).to.be.false;

                let returnValue = instance.jwt( {

                    algorithm: 'HS256',
                    key: 'secret'
                });

                expect( returnValue ).to.equal( instance );

                expect( instance._jwt ).to.exist;
                expect( instance._jwt.enabled ).to.be.true;
                expect( instance._jwt.algorithm ).to.equal( 'HS256' );
                expect( instance._jwt.key ).to.equal( 'secret' );
            });

            it( 'called without arguments', function() {

                let instance = new APIHandler();
                expect( instance._jwt ).to.exist;
                expect( instance._jwt.enabled ).to.be.false;

                let returnValue = instance.jwt();

                expect( returnValue ).to.equal( instance );

                expect( instance._jwt ).to.exist;
                expect( instance._jwt.enabled ).to.be.false;
            });

            if( 'called with false', function() {

                const instance = new APIHandler();
                expect( instance._jwt ).to.exist;
                expect( instance._jwt.enabled ).to.be.false;

                const returnValue = instance.jwt( false );

                expect( returnValue ).to.equal( instance );

                expect( instance._jwt ).to.exist;
                expect( instance._jwt.enabled ).to.be.false;
            });
        });

        describe( '.headers', function() {

            it( 'normal operation', function() {

                let instance = new APIHandler();
                expect( instance._headers ).to.eql( {} );

                let newHeaders = {

                    header1: 'A',
                    header2: 'B'
                };

                let returnValue = instance.headers( newHeaders );
                expect( returnValue ).to.equal( instance );

                expect( instance._headers ).to.eql( newHeaders );
                expect( instance._headers ).to.not.equal( newHeaders );  // should be cloned
            });

            it( 'called multple times to compount items', function() {

                let instance = new APIHandler();
                expect( instance._headers ).to.eql( {} );

                let newHeaders = {

                    header1: 'A',
                    header2: 'B'
                };

                let returnValue = instance.headers( newHeaders );
                expect( returnValue ).to.equal( instance );

                expect( instance._headers ).to.eql( newHeaders );

                let newNewHeaders = {

                    header3: 'C',
                    header4: 'D'
                };

                instance.headers( newNewHeaders );
                expect( instance._headers ).to.eql( {

                    header1: 'A',
                    header2: 'B',
                    header3: 'C',
                    header4: 'D'
                });
            });

            it( 'called without arguments', function() {

              let instance = new APIHandler();
              expect( instance._headers ).to.eql( {} );

              instance.headers();
              expect( instance._headers ).to.eql( {} );
            });
        });

        describe( '.header', function() {

            it( 'normal operation', function() {

                let instance = new APIHandler();
                expect( instance._headers ).to.eql( {} );

                let returnValue = instance.header( 'header1', 'A' );
                expect( returnValue ).to.equal( instance );

                expect( instance._headers ).to.eql( {

                    header1: 'A'
                });

                instance.header( 'header2', 'B' );
                expect( instance._headers ).to.eql( {

                    header1: 'A',
                    header2: 'B'
                });
            });

            it( 'name is not set', function() {

                let instance = new APIHandler();
                expect( instance._headers ).to.eql( {} );

                let returnValue = instance.header();
                expect( returnValue ).to.equal( instance );

                expect( instance._headers ).to.eql( {} );
            });

            it( 'value not set', function() {

                let instance = new APIHandler();
                expect( instance._headers ).to.eql( {} );

                let returnValue = instance.header( 'myHeader' );
                expect( returnValue ).to.equal( instance );

                expect( instance._headers ).to.eql( {} );
            });

            it( 'value is false', function() {

                let instance = new APIHandler();
                expect( instance._headers ).to.eql( {} );

                let returnValue = instance.header( 'myHeader', false );
                expect( returnValue ).to.equal( instance );

                expect( instance._headers ).to.eql( {

                    myHeader: "false"
                });
            });

            it( 'value is null', function() {

                let instance = new APIHandler();
                expect( instance._headers ).to.eql( {} );

                let returnValue = instance.header( 'myHeader', null );
                expect( returnValue ).to.equal( instance );

                expect( instance._headers ).to.eql( {} );
            });
        });

        describe( '.cors', function() {

            it( 'normal operation with partial cors', function() {

                let instance = new APIHandler();
                instance.headers( {

                    header1: 'A',
                    header2: 'B'
                });

                let returnValue = instance.cors( {

                    allowOrigin: 'https://whatever.vandium.io',
                    allowCredentials: true
                });

                expect( returnValue ).to.equal( instance );
                expect( instance._headers ).to.eql( {

                    header1: 'A',
                    header2: 'B',
                    'Access-Control-Allow-Origin': 'https://whatever.vandium.io',
                    'Access-Control-Allow-Credentials': 'true'
                });
            });

            it( 'normal operation with all cors values', function() {

                let instance = new APIHandler();
                instance.headers( {

                    header1: 'A',
                    header2: 'B'
                });

                let returnValue = instance.cors( {

                    allowOrigin: 'https://whatever.vandium.io',
                    allowCredentials: true,
                    exposeHeaders: 'exposed-header-here',
                    maxAge: 600,
                    allowHeaders: 'allowed-header-here'
                });

                expect( returnValue ).to.equal( instance );
                expect( instance._headers ).to.eql( {

                    header1: 'A',
                    header2: 'B',
                    'Access-Control-Allow-Origin': 'https://whatever.vandium.io',
                    'Access-Control-Allow-Credentials': 'true',
                    'Access-Control-Expose-Headers': 'exposed-header-here',
                    'Access-Control-Max-Age': '600',
                    'Access-Control-Allow-Headers': 'allowed-header-here'
                });
            });

            it( 'normal operation with all cors values, array values for exposedHeaders and allowHeaders', function() {

                let instance = new APIHandler();
                instance.headers( {

                    header1: 'A',
                    header2: 'B'
                });

                let returnValue = instance.cors( {

                    allowOrigin: 'https://whatever.vandium.io',
                    allowCredentials: true,
                    exposeHeaders: ['exposed-header-here', 'another-header' ],
                    maxAge: 600,
                    allowHeaders: ['allowed-header-here']
                });

                expect( returnValue ).to.equal( instance );
                expect( instance._headers ).to.eql( {

                    header1: 'A',
                    header2: 'B',
                    'Access-Control-Allow-Origin': 'https://whatever.vandium.io',
                    'Access-Control-Allow-Credentials': 'true',
                    'Access-Control-Expose-Headers': 'exposed-header-here, another-header',
                    'Access-Control-Max-Age': '600',
                    'Access-Control-Allow-Headers': 'allowed-header-here'
                });
            });

            it( 'called without arguments', function() {

              let instance = new APIHandler();
              expect( instance._headers ).to.eql( {} );

              instance.cors();
              expect( instance._headers ).to.eql( {} );
            });
        });

        describe( '.protection', function() {

            it( 'normal operation', function() {

                let instance = new APIHandler();
                expect( instance._protection ).to.exist;
                expect( instance._protection.sql.mode ).to.equal( 'report' );

                let returnValue = instance.protection( {

                    mode: 'fail'
                });
                expect( returnValue ).to.equal( instance );


                expect( instance._protection ).to.exist;
                expect( instance._protection.sql.mode ).to.equal( 'fail' );
            });
        });

        describe( '.onError', function() {

            it( 'normal operation', function() {

                let instance = new APIHandler();

                expect( instance._onErrorHandler ).to.exist;

                let customOnError = ( err ) => { return err; };

                let returnValue = instance.onError( customOnError );
                expect( returnValue ).to.equal( instance );

                expect( instance._onErrorHandler ).to.equal( customOnError );
            });
        });

        describe( '.addMethodsToHandler', function() {

            it( 'normal operation', function() {

                let lambdaHandler = function( event, context, callback ) { callback(); };

                expect( lambdaHandler.jwt ).to.not.exist;
                expect( lambdaHandler.headers ).to.not.exist;
                expect( lambdaHandler.protection ).to.not.exist;
                expect( lambdaHandler.onError ).to.not.exist;

                let instance = new APIHandler();
                instance.addMethodsToHandler( lambdaHandler );

                expect( lambdaHandler.jwt ).to.exist;
                expect( lambdaHandler.jwt ).to.be.a( 'function' );

                expect( lambdaHandler.headers ).to.exist;
                expect( lambdaHandler.headers ).to.be.a( 'function' );

                expect( lambdaHandler.protection ).to.exist;
                expect( lambdaHandler.protection ).to.be.a( 'function' );

                expect( lambdaHandler.onError ).to.exist;
                expect( lambdaHandler.onError ).to.be.a( 'function' );
            });
        });

        [ 'GET', 'PUT', 'POST', 'DELETE', 'HEAD', 'PATCH' ].forEach( (method) => {

            describe( `.${method}`, function() {

                it( 'normal operation', function() {

                    let instance = new APIHandler();
                    expect( instance.methodHandlers ).to.eql( {} );

                    let returnValue = instance[ method ]( () => {} );
                    expect( returnValue ).to.equal( instance );

                    expect( instance.methodHandlers[ method ] ).to.exist;
                });

                it( 'normal operation, with validation and handler', function() {

                    let instance = new APIHandler();
                    expect( instance.methodHandlers ).to.eql( {} );

                    let returnValue = instance[ method ]()
                                .validation( { body: { name: 'string' } } )
                                .handler( () => {} );

                    expect( returnValue ).to.equal( instance );

                    expect( instance.methodHandlers[ method ] ).to.exist;
                });
            });
        });

        describe( '.validation', function() {

            it( 'normal operation', function() {

                let instance = new APIHandler();
                expect( instance.methodHandlers ).to.eql( {} );

                let returnValue = instance.POST()
                            .validation( { body: { name: 'string' } } );

                expect( returnValue ).to.equal( instance );

                expect( instance.methodHandlers[ 'POST' ] ).to.exist;
            });

            it( 'fail when no method has been set', function() {

                let instance = new APIHandler();
                expect( instance.methodHandlers ).to.eql( {} );

                try {

                    instance.validation( {} );

                    expect.fail( 'should throw error' );
                }
                catch( err ) {

                    expect( err.message ).to.contain( 'Method not selected' );
                }
            });
        });

        describe( '.handler', function() {

            it( 'normal operation', function() {

                let instance = new APIHandler();
                expect( instance.methodHandlers ).to.eql( {} );

                let returnValue = instance.POST()
                            .handler( () => {});

                expect( returnValue ).to.equal( instance );

                expect( instance.methodHandlers[ 'POST' ] ).to.exist;
            });

            it( 'normal operation with validation', function() {

                let instance = new APIHandler();
                expect( instance.methodHandlers ).to.eql( {} );

                let returnValue = instance.POST()
                            .validation( { body: { name: 'string' } } )
                            .handler( () => {});

                expect( returnValue ).to.equal( instance );

                expect( instance.methodHandlers[ 'POST' ] ).to.exist;
            });

            it( 'fail when no method has been set', function() {

                let instance = new APIHandler();
                expect( instance.methodHandlers ).to.eql( {} );

                try {

                    instance.handler( () => {});

                    expect.fail( 'should throw error' );
                }
                catch( err ) {

                    expect( err.message ).to.contain( 'Method not selected' );
                }
            });
        });

        describe( '.executePreprocessors', function() {

            it( 'simple request with body', function() {

                let instance = new APIHandler().PUT( () => {} );

                let state = {

                    event: Object.assign( {}, require( './put-event.json' ) ),
                    context: {}
                }

                let jwtValidateSpy = sinon.spy( instance._jwt, 'validate' );
                let protectionValidateSpy = sinon.spy( instance._protection, 'validate' );

                expect( state.event.cookies ).to.not.exist;
                expect( state.executor ).to.not.exist;

                instance.executePreprocessors( state );

                expect( state.event.cookies ).to.exist;
                expect( state.event.cookies ).to.eql( {} );

                expect( state.executor ).to.exist;

                expect( jwtValidateSpy.calledOnce ).to.be.true;
                expect( jwtValidateSpy.firstCall.args ).to.eql( [ state.event ] );

                expect( protectionValidateSpy.calledOnce ).to.be.true;
                expect( protectionValidateSpy.firstCall.args ).to.eql( [ state.event ] );

                // string encoded body should get parsed
                expect( state.event.body ).to.be.an( 'Object' );
                expect( state.event.body.name ).to.exist;
                expect( state.event.body.name ).to.equal( '   John Doe' );
                expect( Object.getOwnPropertyNames( state.event.body ).length ).to.equal( 1 );

                // rawBody should be present
                expect( state.event.rawBody ).to.be.a( 'String' );
                expect( state.event.rawBody ).to.equal( "{\r\n\t\"name\": \"   John Doe\"\r\n}" );
            });

            it( 'simple request with non-json body', function() {

                let instance = new APIHandler().PUT( () => {} );

                let state = {

                    event: Object.assign( {}, require( './put-event-no-json-body.json' ) ),
                    context: {}
                }

                let jwtValidateSpy = sinon.spy( instance._jwt, 'validate' );
                let protectionValidateSpy = sinon.spy( instance._protection, 'validate' );

                expect( state.event.cookies ).to.not.exist;
                expect( state.executor ).to.not.exist;

                instance.executePreprocessors( state );

                expect( state.event.cookies ).to.exist;
                expect( state.event.cookies ).to.eql( {} );

                expect( state.executor ).to.exist;

                expect( jwtValidateSpy.calledOnce ).to.be.true;
                expect( jwtValidateSpy.firstCall.args ).to.eql( [ state.event ] );

                expect( protectionValidateSpy.calledOnce ).to.be.true;
                expect( protectionValidateSpy.firstCall.args ).to.eql( [ state.event ] );

                // string encoded body should get parsed
                expect( state.event.body ).to.be.a( 'String' );
                expect( state.event.body ).to.equal( 'John Doe' );

                // rawBody should be present
                expect( state.event.rawBody ).to.be.a( 'String' );
                expect( state.event.rawBody ).to.equal( 'John Doe' );
            });

            it( 'request without cookies', function() {

                let instance = new APIHandler().PUT( () => {} );

                let state = {

                    event: Object.assign( {}, require( './put-event.json' ) ),
                    context: {}
                }

                // empty headers
                state.event.headers = {};

                let jwtValidateSpy = sinon.spy( instance._jwt, 'validate' );
                let protectionValidateSpy = sinon.spy( instance._protection, 'validate' );

                expect( state.event.cookies ).to.not.exist;
                expect( state.executor ).to.not.exist;

                instance.executePreprocessors( state );

                expect( state.event.cookies ).to.exist;
                expect( state.event.cookies ).to.eql( {} );

                expect( state.executor ).to.exist;

                expect( jwtValidateSpy.calledOnce ).to.be.true;
                expect( jwtValidateSpy.firstCall.args ).to.eql( [ state.event ] );

                expect( protectionValidateSpy.calledOnce ).to.be.true;
                expect( protectionValidateSpy.firstCall.args ).to.eql( [ state.event ] );
            });


            it( 'request with cookies', function() {

                let instance = new APIHandler().PUT( () => {} );

                let state = {

                    event: Object.assign( {}, require( './put-with-cookies-event.json' ) ),
                    context: {}
                }

                let jwtValidateSpy = sinon.spy( instance._jwt, 'validate' );
                let protectionValidateSpy = sinon.spy( instance._protection, 'validate' );

                expect( state.event.cookies ).to.not.exist;
                expect( state.executor ).to.not.exist;

                instance.executePreprocessors( state );

                expect( state.event.cookies ).to.exist;
                expect( state.event.cookies ).to.eql( {

                    "firstcookie": "chocolate",
                    "secondcookie": "chip",
                    "thirdcookie": "strawberry"
                });

                expect( state.executor ).to.exist;

                expect( jwtValidateSpy.calledOnce ).to.be.true;
                expect( jwtValidateSpy.firstCall.args ).to.eql( [ state.event ] );

                expect( protectionValidateSpy.calledOnce ).to.be.true;
                expect( protectionValidateSpy.firstCall.args ).to.eql( [ state.event ] );
            });


            it( 'request with bad cookies', function() {

                let cookiesStub = {

                    parse: sinon.stub().throws( new Error( 'cannot parse!' ) )
                };

                let proxiedAPIHandler = proxyquire( '../api_handler', {

                    'cookie': cookiesStub
                });


                let instance = new proxiedAPIHandler().PUT( () => {} );

                let state = {

                    event: Object.assign( {}, require( './put-with-cookies-event.json' ) ),
                    context: {}
                }

                let jwtValidateSpy = sinon.spy( instance._jwt, 'validate' );
                let protectionValidateSpy = sinon.spy( instance._protection, 'validate' );

                expect( state.event.cookies ).to.not.exist;
                expect( state.executor ).to.not.exist;

                instance.executePreprocessors( state );

                expect( state.event.cookies ).to.exist;
                expect( state.event.cookies ).to.eql( {} );

                expect( state.executor ).to.exist;

                expect( jwtValidateSpy.calledOnce ).to.be.true;
                expect( jwtValidateSpy.firstCall.args ).to.eql( [ state.event ] );

                expect( protectionValidateSpy.calledOnce ).to.be.true;
                expect( protectionValidateSpy.firstCall.args ).to.eql( [ state.event ] );

                expect( cookiesStub.parse.calledOnce ).to.be.true;
            });

            it( 'queryStringParameters and pathParameters are set', function() {

                let state = {

                    event: Object.assign( {}, require( './put-with-cookies-event.json' ) ),
                    context: {}
                }

                state.event.queryStringParameters = {};
                state.event.pathParameters = {};

                let instance = new APIHandler().PUT( ()=> {});
                instance.executePreprocessors( state );

                expect( state.event.queryStringParameters ).to.eql( {} );
                expect( state.event.pathParameters ).to.eql( {} );
            });

            it( 'queryStringParameters and pathParameters are undefined', function() {

                let state = {

                    event: Object.assign( {}, require( './put-with-cookies-event.json' ) ),
                    context: {}
                }

                delete state.event.queryStringParameters;
                delete state.event.pathParameters;

                let instance = new APIHandler().PUT( ()=> {});
                instance.executePreprocessors( state );

                expect( state.event.queryStringParameters ).to.eql( {} );
                expect( state.event.pathParameters ).to.eql( {} );
            });

            it( 'fail: when method does not exist', function() {

                let instance = new APIHandler().POST( () => {} );

                let state = {

                    event: Object.assign( {}, require( './put-event.json' ) ),
                    context: {}
                };

                expect( instance.executePreprocessors.bind( instance, state ) ).to.throw( 'handler not defined for http method: PUT' );
            });
        });

        describe( '.processResult', function() {

            [
                ['GET',200],
                ['PUT',200],
                ['POST',201],
                ['DELETE',204],
                ['HEAD',200],
                ['PATCH',200]
            ].forEach( (test) => {

                it( `simple value for ${test[0]}`, function() {

                    let instance = new APIHandler();

                    let context = {

                        event: Object.assign( {}, require( './put-event.json' ) )
                    };

                    context.event.httpMethod = test[0];

                    let resultObject = instance.processResult( 'OK', context );

                    expect( resultObject.result.statusCode ).to.equal( test[1] );
                    expect( resultObject.result.headers ).to.eql( {} );
                    expect( resultObject.result.body ).to.equal( 'OK' );
                });

                it( `object value for ${test[0]}`, function() {

                    let instance = new APIHandler();

                    let context = {

                        event: Object.assign( {}, require( './put-event.json' ) )
                    };

                    context.event.httpMethod = test[0];

                    let resultObject = instance.processResult( { ok: true }, context );

                    expect( resultObject.result.statusCode ).to.equal( test[1] );
                    expect( resultObject.result.headers ).to.eql( {} );
                    expect( resultObject.result.body ).to.equal( "{\"ok\":true}");
                });

                it( `defined headers for ${test[0]}`, function() {

                    let instance = new APIHandler().headers( {header1: "1", header2: "2"});

                    let context = {

                        event: Object.assign( {}, require( './put-event.json' ) )
                    };

                    context.event.httpMethod = test[0];

                    let resultObject = instance.processResult( 'OK', context );

                    expect( resultObject.result.statusCode ).to.equal( test[1] );
                    expect( resultObject.result.headers ).to.eql( { header1: "1", header2: "2" } );
                    expect( resultObject.result.body ).to.equal( 'OK' );
                });

                it( `result value with single Set-Cookie header for ${test[0]}`, function() {

                    let instance = new APIHandler();

                    let context = {

                        event: Object.assign( {}, require( './put-event.json' ) )
                    };

                    context.event.httpMethod = test[0];

                    const resultCookie = {
                        name: 'first',
                        value: 'cookie',
                        options: {
                            domain: 'domain.name',
                            encode: encodeURIComponent,
                            expires: new Date(),

                            httpOnly: true,
                            maxAge: 1000,
                            path: '/',
                            sameSite: true,
                            secure: false,
                        }
                    };

                    let resultObject = instance.processResult( {

                        statusCode: 999,
                        setCookie: resultCookie,
                        headers: {

                            header1: '1',
                            header2: '2',
                        },
                        body: {ok: true },
                    }, context );

                    expect( resultObject.result.statusCode ).to.equal( 999 );
                    expect( resultObject.result.headers ).to.eql( {
                        header1: "1",
                        header2: "2",
                        'Set-Cookie': cookie.serialize( resultCookie.name, resultCookie.value, resultCookie.options ),
                    });
                    expect( resultObject.result.body ).to.equal( "{\"ok\":true}");

                });

                it( `result value with single Set-Cookie (string) header for ${test[0]}`, function() {

                    let instance = new APIHandler();

                    let context = {

                        event: Object.assign( {}, require( './put-event.json' ) )
                    };

                    context.event.httpMethod = test[0];

                    const serializedCookie = cookie.serialize( 'first', 'cookie', {
                        domain: 'domain.name',
                        encode: encodeURIComponent,
                        expires: new Date(),

                        httpOnly: true,
                        maxAge: 1000,
                        path: '/',
                        sameSite: true,
                        secure: false,
                    });

                    let resultObject = instance.processResult( {

                        statusCode: 999,
                        setCookie: serializedCookie,
                        headers: {

                            header1: '1',
                            header2: '2',
                        },
                        body: {ok: true },
                    }, context );

                    expect( resultObject.result.statusCode ).to.equal( 999 );
                    expect( resultObject.result.headers ).to.eql( {
                        header1: "1",
                        header2: "2",
                        'Set-Cookie': serializedCookie,
                    });
                    expect( resultObject.result.body ).to.equal( "{\"ok\":true}");

                });
            });

            it( 'result is null', function() {

                let instance = new APIHandler();

                let context = {

                    event: {

                        headers: { }
                    }
                };

                let resultObject = instance.processResult( null, context );

                expect( resultObject.result.body ).to.equal( null );
            });
        });

        describe( '.processError', function() {

            it( 'generic error', async function() {

                let instance = new APIHandler();

                let context = {

                    event: Object.assign( {}, require( './put-event.json' ) )
                };


                let error = new Error( 'bang' );

                let resultObject = await instance.processError( error, context );

                expect( resultObject.result.statusCode ).to.equal( 500 );
                expect( resultObject.result.headers ).to.eql( {} );
                expect( resultObject.result.body ).to.equal( '{"type":"Error","message":"bang"}' );
            });

            it( 'error with status', async function() {

                let instance = new APIHandler();

                let context = {

                    event: Object.assign( {}, require( './put-event.json' ) )
                };


                let error = new Error( 'not found' );
                error.status = 404;

                let resultObject = await instance.processError( error, context );

                expect( resultObject.result.statusCode ).to.equal( 404 );
                expect( resultObject.result.headers ).to.eql( {} );
                expect( resultObject.result.body ).to.equal( '{"type":"Error","message":"not found"}' );
            });

            it( 'error with statusCode', async function() {

                let instance = new APIHandler();

                let context = {

                    event: Object.assign( {}, require( './put-event.json' ) )
                };

                let error = new Error( 'not found' );
                error.statusCode = 404;

                let resultObject = await instance.processError( error, context );

                expect( resultObject.result.statusCode ).to.equal( 404 );
                expect( resultObject.result.headers ).to.eql( {} );
                expect( resultObject.result.body ).to.equal( '{"type":"Error","message":"not found"}' );
            });

            it( 'error with custom error handler updating error (handler does not return error)', async function() {

                let instance = new APIHandler();

                let context = {

                    event: Object.assign( {}, require( './put-event.json' ) ),
                    functionName: 'myTestLambdaFunc'
                };


                let error = new Error( 'not found' );

                instance.onError( (err, _event, _context ) => {

                    expect( _event ).to.equal( context.event );
                    expect( _context ).to.equal( context );
                    expect( _context.functionName ).to.equal( context.functionName );

                    err.status = 404;
                });

                let resultObject = await instance.processError( error, context );

                expect( resultObject.result.statusCode ).to.equal( 404 );
                expect( resultObject.result.headers ).to.eql( {} );
                expect( resultObject.result.body ).to.equal( '{"type":"Error","message":"not found"}' );
            });

            it( 'error with custom async error handler updating error (handler does not return error)', async function() {

                let instance = new APIHandler();

                let context = {

                    event: Object.assign( {}, require( './put-event.json' ) ),
                    functionName: 'myTestLambdaFunc'
                };


                let error = new Error( 'not found' );

                instance.onError( async (err, _event, _context ) => {

                    expect( _event ).to.equal( context.event );
                    expect( _context ).to.equal( context );
                    expect( _context.functionName ).to.equal( context.functionName );

                    return new Promise( (resolve) => {

                        setTimeout( () => {

                            err.status = 404;
                            resolve();
                        }, 20 );
                    });
                });

                let resultObject = await instance.processError( error, context );

                expect( resultObject.result.statusCode ).to.equal( 404 );
                expect( resultObject.result.headers ).to.eql( {} );
                expect( resultObject.result.body ).to.equal( '{"type":"Error","message":"not found"}' );
            });

            it( 'error with custom error handler updating error with body (handler does not return error)', async function() {

                let instance = new APIHandler();

                instance.onError( (err) => {

                    err.status = 400;

                    // from https://tools.ietf.org/html/rfc7807
                    err.body = {

                        type: 'https://example.net/validation-error',
                        title: "Your request parameters didn't validate.",
                        'invalid-params': [ {

                            name: "age",
                            reason: "must be a positive integer"
                        },
                        {
                            name: "color",
                            reason: "must be 'green', 'red' or 'blue'"
                        }]
                    };
                });

                let context = {

                    event: Object.assign( {}, require( './put-event.json' ) )
                };


                let error = new Error( 'Validation Error' );

                let resultObject = await instance.processError( error, context );

                expect( resultObject.result.statusCode ).to.equal( 400 );
                expect( resultObject.result.headers ).to.eql( {} );

                let body = JSON.parse( resultObject.result.body );

                expect( body.type ).to.equal( 'https://example.net/validation-error' );
                expect( body.title ).to.equal( "Your request parameters didn't validate." );
                expect( body[ 'invalid-params' ] ).to.exist;
            });
        });
    });
});
