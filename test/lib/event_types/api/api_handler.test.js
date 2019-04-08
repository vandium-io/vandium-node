'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const sinon = require( 'sinon' );

const zlib = require( 'zlib' );

const proxyquire = require( 'proxyquire' );

const MODULE_PATH = 'lib/event_types/api/api_handler';

const APIHandler = require( '../../../../' + MODULE_PATH );

describe( MODULE_PATH, function() {

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

        describe( '.multiValueHeaders', function() {

            it( 'normal operation', function() {

                let instance = new APIHandler();
                expect( instance._multiValueHeaders ).to.eql( {} );

                let newHeaders = {

                    header1: [ 'A', 'B' ],
                };

                let returnValue = instance.multiValueHeaders( newHeaders );
                expect( returnValue ).to.equal( instance );

                expect( instance._multiValueHeaders ).to.eql( newHeaders );
                expect( instance._multiValueHeaders ).to.not.equal( newHeaders );  // should be cloned
            });

            it( 'called multple times to compound items', function() {

                let instance = new APIHandler();
                expect( instance._multiValueHeaders ).to.eql( {} );

                let newHeaders = {

                    header1: [ 'A', 'B' ],
                };

                let returnValue = instance.multiValueHeaders( newHeaders );
                expect( returnValue ).to.equal( instance );

                expect( instance._multiValueHeaders ).to.eql( newHeaders );

                let newNewHeaders = {

                    header1: [ 'C', 'D' ],
                    header2: [ 'E', 'F' ],
                };

                instance.multiValueHeaders( newNewHeaders );
                expect( instance._multiValueHeaders ).to.eql( {

                    header1: [ 'A', 'B', 'C', 'D' ],
                    header2: [ 'E', 'F' ],
                });
            });

            it( 'called without arguments', function() {

              let instance = new APIHandler();
              expect( instance._multiValueHeaders ).to.eql( {} );

              instance.multiValueHeaders();
              expect( instance._multiValueHeaders ).to.eql( {} );
            });
        });

        describe( '.multiValueHeader', function() {

            it( 'normal operation', function() {

                let instance = new APIHandler();
                expect( instance._multiValueHeaders ).to.eql( {} );

                let returnValue = instance.multiValueHeader( 'header1', [ 'A' ] );
                expect( returnValue ).to.equal( instance );

                expect( instance._multiValueHeaders ).to.eql( {

                    header1: [ 'A' ],
                });

                instance.multiValueHeader( 'header2', 'B' );
                expect( instance._multiValueHeaders ).to.eql( {

                    header1: [ 'A' ],
                    header2: [ 'B' ],
                });
            });

            it( 'name is not set', function() {

                let instance = new APIHandler();
                expect( instance._multiValueHeaders ).to.eql( {} );

                let returnValue = instance.multiValueHeader();
                expect( returnValue ).to.equal( instance );

                expect( instance._multiValueHeaders ).to.eql( {} );
            });

            it( 'value not set', function() {

                let instance = new APIHandler();
                expect( instance._multiValueHeaders ).to.eql( {} );

                let returnValue = instance.multiValueHeader( 'myHeader' );
                expect( returnValue ).to.equal( instance );

                expect( instance._multiValueHeaders ).to.eql( {} );
            });

            it( 'value is false', function() {

                let instance = new APIHandler();
                expect( instance._multiValueHeaders ).to.eql( {} );

                let returnValue = instance.multiValueHeader( 'myHeader', false );
                expect( returnValue ).to.equal( instance );

                expect( instance._multiValueHeaders ).to.eql( {

                    myHeader: [ "false" ]
                });
            });

            it( 'value is null', function() {

                let instance = new APIHandler();
                expect( instance._multiValueHeaders ).to.eql( {} );

                let returnValue = instance.multiValueHeader( 'myHeader', null );
                expect( returnValue ).to.equal( instance );

                expect( instance._multiValueHeaders ).to.eql( {} );
            });

            it( 'key already exists', function() {

                let instance = new APIHandler().multiValueHeader( 'header1', [ 'val1', 'val2' ] );
                expect( instance._multiValueHeaders ).to.eql( { header1 : [ 'val1', 'val2' ] } );

                let returnValue = instance.multiValueHeader( 'header1', [ 'val3' ] );
                expect( returnValue ).to.equal( instance );

                expect( instance._multiValueHeaders ).to.eql( { header1 : [ 'val1', 'val2', 'val3' ] } );
            });

            it( 'value is a single string or primitive and key does not exist', function() {

                let instance = new APIHandler().multiValueHeader( 'header1', 'val1' );
                expect( instance._multiValueHeaders ).to.eql( { header1 : [ 'val1' ] } );

                let returnValue = instance.multiValueHeader( 'header2', 12 );
                expect( instance._multiValueHeaders ).to.eql( { header1: [ 'val1' ], header2 : [ '12' ] } );
            });

            it( 'value is a single string or primitive and key already exists', function() {

                let instance = new APIHandler().multiValueHeader( 'header1', 'val1' );
                expect( instance._multiValueHeaders ).to.eql( { header1 : [ 'val1' ] } );

                let returnValue = instance.multiValueHeader( 'header1', [ 'val2' ] );
                expect( returnValue ).to.equal( instance );

                expect( instance._multiValueHeaders ).to.eql( { header1 : [ 'val1', 'val2' ] } );
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

                let proxiedAPIHandler = proxyquire( '../../../../' + MODULE_PATH, {

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

                    let instance = new APIHandler().headers( { header1: "1", header2: "2" });

                    let context = {

                        event: Object.assign( {}, require( './put-event.json' ) )
                    };

                    context.event.httpMethod = test[0];

                    let resultObject = instance.processResult( 'OK', context );

                    expect( resultObject.result.statusCode ).to.equal( test[1] );
                    expect( resultObject.result.headers ).to.eql( { header1: "1", header2: "2" } );
                    expect( resultObject.result.body ).to.equal( 'OK' );
                });

                it( `defined multiValueHeaders for ${test[0]}`, function() {

                    let instance = new APIHandler().multiValueHeaders( { 'Set-Cookie': [ 'val1', 'val2' ] } );

                    let context = {

                        event: Object.assign( {}, require( './put-event.json' ) )
                    };

                    context.event.httpMethod = test[0];

                    let resultObject = instance.processResult( 'OK', context );

                    expect( resultObject.result.statusCode ).to.equal( test[1] );
                    expect( resultObject.result.multiValueHeaders ).to.eql( { 'Set-Cookie': [ 'val1', 'val2' ] } );
                    expect( resultObject.result.body ).to.equal( 'OK' );
                });

                it( `result value for ${test[0]}`, function() {

                    let instance = new APIHandler();

                    let context = {

                        event: Object.assign( {}, require( './put-event.json' ) )
                    };

                    context.event.httpMethod = test[0];

                    let resultObject = instance.processResult( {

                        statusCode: 999,

                        multiValueHeaders: { 
                            'Set-Cookie': [ 'val1', 'val2' ] 
                        },

                        headers: { 
                            header1: '1', 
                            header2: '2', 
                        },
                        body: { ok: true }
                    }, context );

                    expect( resultObject.result.statusCode ).to.equal( 999 );
                    expect( resultObject.result.headers ).to.eql( { header1: "1", header2: "2" } );
                    expect( resultObject.result.multiValueHeaders ).to.eql( { 'Set-Cookie': ['val1', 'val2'] } );
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

            it( 'generic error', function() {

                let instance = new APIHandler();

                let context = {

                    event: Object.assign( {}, require( './put-event.json' ) )
                };


                let error = new Error( 'bang' );

                let resultObject = instance.processError( error, context );

                expect( resultObject.result.statusCode ).to.equal( 500 );
                expect( resultObject.result.headers ).to.eql( {} );
                expect( resultObject.result.body ).to.equal( '{"type":"Error","message":"bang"}' );
            });

            it( 'error with status', function() {

                let instance = new APIHandler();

                let context = {

                    event: Object.assign( {}, require( './put-event.json' ) )
                };


                let error = new Error( 'not found' );
                error.status = 404;

                let resultObject = instance.processError( error, context );

                expect( resultObject.result.statusCode ).to.equal( 404 );
                expect( resultObject.result.headers ).to.eql( {} );
                expect( resultObject.result.body ).to.equal( '{"type":"Error","message":"not found"}' );
            });

            it( 'error with statusCode', function() {

                let instance = new APIHandler();

                let context = {

                    event: Object.assign( {}, require( './put-event.json' ) )
                };


                let error = new Error( 'not found' );
                error.statusCode = 404;

                let resultObject = instance.processError( error, context );

                expect( resultObject.result.statusCode ).to.equal( 404 );
                expect( resultObject.result.headers ).to.eql( {} );
                expect( resultObject.result.body ).to.equal( '{"type":"Error","message":"not found"}' );
            });

            it( 'error with custom error handler updating error (handler does not return error)', function() {

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

                let resultObject = instance.processError( error, context );

                expect( resultObject.result.statusCode ).to.equal( 404 );
                expect( resultObject.result.headers ).to.eql( {} );
                expect( resultObject.result.body ).to.equal( '{"type":"Error","message":"not found"}' );
            });

            it( 'error with custom error handler updating error with body (handler does not return error)', function() {

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

                let resultObject = instance.processError( error, context );

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
