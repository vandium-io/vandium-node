'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const LambdaTester = require( 'lambda-tester' );

const jwtBuilder = require( 'jwt-builder' );

const configUtils = require( './config-utils' );

const VANDIUM_MODULE_PATH = '../../lib/index';

const vandium = require( VANDIUM_MODULE_PATH );

const singleton = require( '../../lib/singleton_instance' );

const envRestorer = require( 'env-restorer' );

//require( '../lib/logger' ).setLevel( 'debug' );

describe( 'index', function() {

    beforeEach( function() {

        configUtils.removeConfig();

        singleton.reset();

        envRestorer.restore();
    });

    after( function() {

        // NEED to disable eval prevention
        process.env.VANDIUM_PREVENT_EVAL = "false"
        require( '../../lib/prevent' ).configure();

        envRestorer.restore();
    });

	describe( '.vandium', function() {

		it( 'simple wrap with no jwt or validation', function() {

            const handler = vandium( function( event, context ) {

                // should route to callback( null, 'ok' );
                context.succeed( 'ok' );
            });

            return LambdaTester( handler )
                .expectResult( function( result ) {

                    expect( result ).to.equal( 'ok' );
                });
        });

        it( 'simple wrap with no jwt or validation using callback( null, result )', function() {

            const handler = vandium( function( event, context, callback ) {

                callback( null, 'ok' );
            });

            return LambdaTester( handler )
                .expectResult( function( result ) {

                    expect( result ).to.equal( 'ok' );
                });
        });

        it( 'simple wrap with no jwt or validation using callback( err )', function() {

            const handler = vandium( function( event, context, callback ) {

                callback( new Error( 'bang' ) );
            });

            return LambdaTester( handler )
                .expectError( function( err ) {

                    expect( err.message ).to.equal( 'bang' );
                    expect( err.stack ).to.equal( '' );
                });
        });

        it( 'simple wrap with no jwt or validation using callback( err ), vandium.stripErrors( false )', function() {

            vandium.stripErrors( false );

            const handler = vandium( function( event, context, callback ) {

                callback( new Error( 'bang' ) );
            });

            return LambdaTester( handler )
                .expectError( function( err ) {

                    expect( err.message ).to.equal( 'bang' );
                    expect( err.stack ).to.exist;
                });
        });

        it( 'simple wrap with no jwt or validation using callback( string )', function() {

            const handler = vandium( function( event, context, callback ) {

                callback( 'bang' );
            });

            return LambdaTester( handler )
                .expectError( function( err ) {

                    expect( err.message ).to.equal( 'bang' );
                });
        });


        it( 'simple wrap with no jwt or validation using context.fail( err )', function() {

            const handler = vandium( function( event, context ) {

                context.fail( new Error( 'bang' ) );
            });

            return LambdaTester( handler )
                .expectError( function( err ) {

                    expect( err.message ).to.equal( 'bang' );
                });
        });

        it( 'simple wrap with no jwt or validation using context.fail()', function() {

            const handler = vandium( function( event, context ) {

                context.fail();
            });

            return LambdaTester( handler )
                .expectError( function( err ) {

                    expect( err ).to.be.instanceof( Error );
                });
        });

        it( 'simple wrap, return value', function( done ) {

            const handler = vandium( function( event, context ) {

                context.succeed( 'ok' );

                return 42;
            });

            let context = {

                getRemainingTimeInMillis: function() { return 5000 }
            };

            // Can't use lambda-tester here (just yet!)

            let returnValue = handler( {}, context, function( err, result ) {

                if( err ) {

                    return done( err );
                }

                done();
            });

            expect( returnValue ).to.equal( 42 );
        });

        it( 'simple validation using vandium.jwt.configure()', function() {

            vandium.validation( {

                name: vandium.types.string().required(),

                age: vandium.types.number().min( 0 ).max( 120 ).required(),

                jwt: vandium.types.any()
            });

            vandium.jwt.configure( {

                algorithm: 'HS256',
                secret: 'super-secret'
            });

            const handler = vandium( function( event, context ) {

                context.succeed( 'ok' );
            });

            const token = jwtBuilder( { algorithm: 'HS256', secret: 'super-secret', user: 'fred' } );

            return LambdaTester( handler )
                .event( { name: 'fred', age: 16, jwt: token } )
                .expectResult( function( result ) {

                    expect( result ).to.equal( 'ok' );
                });
        });

        it( 'simple validation with sql injection protection', function() {

            vandium.validation( {

                name: vandium.types.string().required(),

                age: vandium.types.number().min( 0 ).max( 120 ).required(),

                jwt: vandium.types.any()
            });

            vandium.protect.sql.fail();

            vandium.jwt().configure( {

                algorithm: 'HS256',
                secret: 'super-secret'
            });

            const handler = vandium( function( event, context ) {

                context.succeed( 'ok' );
            });

            const token = jwtBuilder( { user: 'fred', secret: 'super-secret', algorithm: 'HS256' } );

            return LambdaTester( handler )
                .event( { name: 'fred', age: 16, jwt: token } )
                .expectResult( function( result ) {

                    expect( result ).to.equal( 'ok' );
                });
        });

        it( 'validation where value is missing', function() {

            vandium.validation( {

                name: vandium.types.string().required(),

                age: vandium.types.number().min( 0 ).max( 120 ).required()
            })

            var handler = vandium( function( event, context ) {

                context.succeed( 'ok' );
            });

            return LambdaTester( handler )
                .event( { name: 'fred' } )
                .expectError( function( err ) {

                    expect( err.message ).to.contain( 'validation error:' );
                });
        });

        it( 'handle resolve from a promise', function() {

            const handler = vandium( function( /*event, context, callback*/ ) {

                return new Promise( function( resolve, reject ) {

                    setTimeout( function() {

                        resolve( 'ok' );

                    }, 50 );
                });
            });

            return LambdaTester( handler )
                .expectResult( function( result ) {

                    expect( result ).to.equal( 'ok' );
                });
        });

        it( 'handle reject from a promise', function() {

            const handler = vandium( function( /*event, context, callback*/ ) {

                return new Promise( function( resolve, reject ) {

                    setTimeout( function() {

                        reject( new Error( 'bang' ) );

                    }, 50 );
                });
            });

            return LambdaTester( handler )
                .expectError( function( err ) {

                    expect( err.message ).to.equal( 'bang' );
                });
        });

        it( 'uncaught exceptions', function() {

            const handler = vandium( function( /*event, context, callback*/ ) {

                throw new Error( 'bang' );
            });

            return LambdaTester( handler )
                .expectError( function( err ) {

                    expect( err.message ).to.equal( 'bang' );
                });
        });

        it( 'uncaught exceptions - disable logging', function() {

            vandium.logUncaughtExceptions( false );

            const handler = vandium( function( /*event, context, callback*/ ) {

                throw new Error( 'bang' );
            });

            return LambdaTester( handler )
                .expectError( function( err ) {

                    expect( err.message ).to.equal( 'bang' );
                });
        });

        it( 'with after() async with handler calling callback( null, result )', function() {

            let afterCalled = false;

            vandium.after( function( done ) {

                afterCalled = true;
                done();
            })

            const handler = vandium( function( event, context, callback ) {

                callback( null, 'ok' );
            });

            return LambdaTester( handler )
                .expectResult( function( result ) {

                    expect( result ).to.equal( 'ok' );
                    expect( afterCalled ).to.be.true;
                });
        });

        it( 'with after() async [calling done(err) ] with handler calling callback( null, result )', function() {

            let afterCalled = false;

            vandium.after( function( done ) {

                afterCalled = true;
                done( new Error( 'bang' ) );
            })

            const handler = vandium( function( event, context, callback ) {

                callback( null, 'ok' );
            });

            return LambdaTester( handler )
                .expectResult( function( result ) {

                    expect( result ).to.equal( 'ok' );
                    expect( afterCalled ).to.be.true;
                });
        });

        it( 'simple wrap with no jwt or validation, eval disabled', function() {

            process.env.VANDIUM_PREVENT_EVAL = 'false';

            const handler = vandium( function( event, context ) {

                eval( 'let x = 5;' );

                context.succeed( 'ok' );
            });

            return LambdaTester( handler )
                .expectResult( function( result ) {

                    expect( result ).to.equal( 'ok' );
                });
        });

        it( 'multiple wrap case', function() {

            vandium( function( event, context ) {

                // should route to callback( null, 'ok' );
                context.succeed( 'ok' );
            });

            const handler2 = vandium( function( event, context ) {

                // should route to callback( null, 'ok' );
                context.succeed( 'ok!' );
            });

            return LambdaTester( handler2 )
                .expectResult( function( result ) {

                    expect( result ).to.equal( 'ok!' );
                });
        });

        it( 'fail: simple wrap with no jwt or validation, eval prevented', function() {

            const handler = vandium( function( event, context, callback ) {

                eval( 'let x = 5;' );

                // never gets here
                callback( null, 'ok' );
            });

            return LambdaTester( handler )
                .expectError( function( err ) {

                    expect( err.message ).to.contain( 'security violation' );
                });
        });

        it( 'with after() async with handler calling callback( err )', function() {

            let afterCalled = false;

            vandium.after( function( done ) {

                afterCalled = true;
                done();
            })

            const handler = vandium( function( event, context, callback ) {

                callback( new Error( 'bang' ) );
            });

            return LambdaTester( handler )
                .expectError( function( err ) {

                    expect( err.message ).to.equal( 'bang' );
                    expect( afterCalled ).to.be.true;
                });
        });

        it( 'with after() sync with handler calling callback( result )', function() {

            let afterCalled = false;

            vandium.after( function() {

                afterCalled = true;
            })

            const handler = vandium( function( event, context, callback ) {

                callback( null, 'ok' );
            });

            return LambdaTester( handler )
                .expectResult( function( result ) {

                    expect( result ).to.equal( 'ok' );
                    expect( afterCalled ).to.be.true;
                });
        });

        it( 'with after() promise and handler returning promise - result', function() {

            let afterCalled = false;

            vandium.after( function() {

                afterCalled = true;

                return Promise.resolve();
            })

            const handler = vandium( function() {

                return Promise.resolve( 'ok' );
            });

            return LambdaTester( handler )
                .expectResult( function( result ) {

                    expect( result ).to.equal( 'ok' );
                    expect( afterCalled ).to.be.true;
                });
        });

        it( 'with after() promise and handler returning promise - error', function() {

            let afterCalled = false;

            vandium.after( function() {

                afterCalled = true;
                return Promise.reject( new Error( 'bang' ) )
            })

            const handler = vandium( function() {

                return Promise.resolve( 'ok' );
            });

            return LambdaTester( handler )
                .expectResult( function( result ) {

                    expect( result ).to.equal( 'ok' );
                    expect( afterCalled ).to.be.true;
                });
        });

        it( 'with non-function after() call', function() {

            vandium.after( 'not-a-function!' );

            const handler = vandium( function() {

                return Promise.resolve( 'ok' );
            });

            return LambdaTester( handler )
                .expectResult( function( result ) {

                    expect( result ).to.equal( 'ok' );
                });
        });

        it( 'with no-value after() call', function() {

            vandium.after();

            const handler = vandium( function() {

                return Promise.resolve( 'ok' );
            });

            return LambdaTester( handler )
                .expectResult( function( result ) {

                    expect( result ).to.equal( 'ok' );
                });
        });

        it( 'Exception thrown in after() call', function() {

            vandium.after( function() { throw new Error( 'bang' ); } );

            const handler = vandium( function() {

                return Promise.resolve( 'ok' );
            });

            return LambdaTester( handler )
                .expectResult( function( result ) {

                    expect( result ).to.equal( 'ok' );
                });
        });

        it( 'two handlers defined without bleed', function() {

            vandium.validation( {

                name: 'string:required'
            });

            vandium.jwt.configure( {

                algorithm: 'HS256',
                secret: 'super-secret'
            });

            const handler1 = vandium( function( event, context ) {

                context.succeed( 'ok' );
            });

            vandium.validation( {

                age: 'number: required'
            });

            vandium.jwt.configure( {

                algorithm: 'HS256',
                secret: 'more-secret'
            });

            const handler2 = vandium( function( event, context ) {

                context.succeed( 'great' );
            });

            const token1 = jwtBuilder( { algorithm: 'HS256', secret: 'super-secret', user: 'fred' } );
            const token2 = jwtBuilder( { algorithm: 'HS256', secret: 'more-secret', user: 'joe' } );

            return LambdaTester( handler1 )
                .event( { name: 'fred', jwt: token1 } )
                .expectResult( function( result1 ) {

                    expect( result1 ).to.equal( 'ok' );

                    return LambdaTester( handler2 )
                        .event( { age: 42, jwt: token2 } )
                        .expectResult( function( result2 ) {

                            expect( result2 ).to.equal( 'great' );
                        });
                });
        });
	});

    describe( '.jwt', function() {

        describe( 'function', function() {

            it( 'normal operation', function() {

                let jwt = vandium.jwt();

                expect( jwt.state.enabled ).to.equal( false );

                // should be same instance
                expect( vandium.jwt() ).to.equal( jwt );
            });
        });

        describe( '.configure', function() {

            it( 'normal operation', function() {

                let jwt = vandium.jwt();

                // stage vars should be enabled by default
                expect( jwt.state ).to.eql( { enabled: false } );

                vandium.jwt().configure( { algorithm: 'HS256', secret: 'my-secret' } );
                expect( jwt.state ).to.eql( { enabled: true, key: 'my-secret', algorithm: 'HS256', tokenName: 'jwt', xsrf: false } );
                expect( vandium.jwt().isEnabled() ).to.be.true;

                // should still be set
                jwt = vandium.jwt();
                expect( jwt.state ).to.eql( { enabled: true, key: 'my-secret', algorithm: 'HS256', tokenName: 'jwt', xsrf: false } );
            })
        });

        describe( '.enable', function() {

            it( 'enable( true )', function() {

                let jwt = vandium.jwt();

                expect( jwt.state.enabled ).to.be.false;

                vandium.jwt.enable( true );

                expect( jwt.state.enabled ).to.be.true;
            });

            it( 'enable( false )', function() {

                let jwt = vandium.jwt();

                expect( jwt.state.enabled ).to.be.false;

                vandium.jwt.enable( true );
                vandium.jwt.enable( false );

                expect( jwt.state.enabled ).to.be.false;
            });
        });
    });

    describe( '.validation', function() {

        it( 'normal operation', function() {

            // no params should be ok
            vandium.validation();

            // call again with schema
            vandium.validation( {

                name: vandium.types.string()
            });
        });
    });

    describe( '.validator', function() {

        it( 'normal operation', function() {

            expect( vandium.validator ).to.exist;

            // future: will need to change to allow other validators to be present
            expect( vandium.validator ).to.equal( require( 'joi' ) );
        });
    });

    describe( '.createInstance', function() {

        it( 'normal operation', function() {

            let instance1 = vandium.createInstance();

            expect( instance1.constructor.name ).to.equal( 'Vandium' );

            let instance2 = vandium.createInstance();

            expect( instance2.constructor.name ).to.equal( 'Vandium' );

            expect( instance1 ).to.not.equal( instance2 );
        });
    });

    describe( 'create singleton instance with configuration file', function() {

        it( 'auto update when vandium.json is present', function() {

            let config = {

                jwt: {

                    algorithm: 'HS256',
                    secret: 'my-secret'
                },

                validation: {

                    schema: {

                        name: 'string:min=1,max=60,trim,required'
                    }
                }
            };

            configUtils.writeConfig( JSON.stringify( config ) );

            let token = jwtBuilder( { user: 'fred', secret: 'my-secret', algorithm: 'HS256' } );

            const handler = vandium( function( event ) {

                if( event.name === 'fred' && event.jwt.claims.user ) {

                    return Promise.resolve( event.jwt.claims.user );
                }

                return Promise.reject( new Error( 'invalid event state' ) );
            });

            return LambdaTester( handler )
                .event( { jwt: token, name: '   fred   ' } )
                .expectResult( function( result ) {

                    expect( result ).to.equal( 'fred' );
                });

        });

        it( 'auto update when vandium.json is present with s3 load', function() {

            const superSpecial = 'specialtime-' + Date.now();

            let config = {

                jwt: {

                    algorithm: 'HS256',
                    secret: 'my-secret'
                },

                validation: {

                    schema: {

                        name: 'string:min=1,max=60,trim,required'
                    }
                },

                s3: {

                    bucket: 'test',
                    key: 'test-key'
                },

                env: {

                    SUPER_SPECIAL: superSpecial
                }
            };

            configUtils.writeConfig( JSON.stringify( config ) );

            let token = jwtBuilder( { user: 'fred', secret: 'my-secret', algorithm: 'HS256' } );


            const handler = vandium( function( event ) {

                if( event.name === 'fred' && event.jwt.claims.user && process.env.SUPER_SPECIAL === superSpecial ) {

                    return Promise.resolve( event.jwt.claims.user );
                }

                return Promise.reject( new Error( 'invalid event state' ) );
            });

            return LambdaTester( handler )
                .event( { jwt: token, name: '   fred   ' } )
                .expectResult( function( result ) {

                    expect( result ).to.equal( 'fred' );
                });

        });
    });
});
