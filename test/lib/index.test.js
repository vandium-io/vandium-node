'use strict';

/*jshint expr: true*/

const preventRestorer = require( './prevent/restorer' );

const expect = require( 'chai' ).expect;

const freshy = require( 'freshy' );

const LambdaTester = require( 'lambda-tester' );

const jwtBuilder = require( 'jwt-builder' );

const sinon = require( 'sinon' );

const configUtils = require( './config-utils' );

const VANDIUM_MODULE_PATH = '../../lib/index';


//require( '../lib/logger' ).setLevel( 'debug' );

describe( 'index', function() {

    before( function( done ) {

        freshy.unload( '../../lib/config' );

        configUtils.removeConfig( done );
    });

    beforeEach( function( done ) {

        preventRestorer.restore();

        freshy.unload( VANDIUM_MODULE_PATH );
        freshy.unload( '../../lib/config' );
        freshy.unload( '../../lib/plugins' );

        configUtils.removeConfig( done );
    });

    after( function() {

        freshy.unload( VANDIUM_MODULE_PATH );
        freshy.unload( '../../lib/config' );
        freshy.unload( '../../lib/plugins' );

        preventRestorer.restore();
    });

	describe( '.vandium', function() {

		it( 'simple wrap with no jwt or validation', function() {

            let vandium = require( VANDIUM_MODULE_PATH );

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

            let vandium = require( VANDIUM_MODULE_PATH );

            const handler = vandium( function( event, context, callback ) {

                callback( null, 'ok' );
            });

            return LambdaTester( handler )
                .expectResult( function( result ) {

                    expect( result ).to.equal( 'ok' );
                });
        });

        it( 'simple wrap with no jwt or validation using callback( err )', function() {

            let vandium = require( VANDIUM_MODULE_PATH );

            const handler = vandium( function( event, context, callback ) {

                callback( new Error( 'bang' ) );
            });

            return LambdaTester( handler )
                .expectError( function( err ) {

                    expect( err.message ).to.equal( 'bang' );
                });
        });

        it( 'simple wrap with no jwt or validation using context.fail( err )', function() {

            let vandium = require( VANDIUM_MODULE_PATH );

            const handler = vandium( function( event, context ) {

                context.fail( new Error( 'bang' ) );
            });

            return LambdaTester( handler )
                .expectError( function( err ) {

                    expect( err.message ).to.equal( 'bang' );
                });
        });

        it( 'simple wrap with no jwt or validation using context.fail()', function() {

            let vandium = require( VANDIUM_MODULE_PATH );

            const handler = vandium( function( event, context ) {

                context.fail();
            });

            return LambdaTester( handler )
                .expectError( function( err ) {

                    expect( err ).to.be.instanceof( Error );
                });
        });

        it( 'simple wrap, return value', function( done ) {

            let vandium = require( VANDIUM_MODULE_PATH );

            const handler = vandium( function( event, context ) {

                context.succeed( 'ok' );

                return 42;
            });

            let context = {

                succeed: sinon.stub(),

                fail: sinon.stub(),

                done: sinon.stub()
            };

            // Can't use lambda-tester here (just yet!)

            let returnValue = handler( {}, context, function( err, result ) {

                if( err ) {

                    return done( err );
                }

                try {

                    expect( result ).to.equal( result );

                    expect( context.succeed.called ).to.be.false;
                    expect( context.fail.called ).to.be.false;
                    expect( context.done.called ).to.be.false;

                    done();
                }
                catch( e ) {

                    done( e );
                }
            });

            expect( returnValue ).to.equal( 42 );
        });

        it( 'simple validation using vandium.jwt.configure()', function() {

            let vandium = require( VANDIUM_MODULE_PATH );

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

            let vandium = require( VANDIUM_MODULE_PATH );

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

            let vandium = require( VANDIUM_MODULE_PATH );

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

            let vandium = require( VANDIUM_MODULE_PATH );

            const handler = vandium( function( /*event, context, callback*/ ) {

                return new Promise( function( resolve, reject ) {

                    setTimeout( function() {

                        resolve( 'ok' );

                    }, 200 );
                });
            });

            return LambdaTester( handler )
                .expectResult( function( result ) {

                    expect( result ).to.equal( 'ok' );
                });
        });

        it( 'handle reject from a promise', function() {

            let vandium = require( VANDIUM_MODULE_PATH );

            const handler = vandium( function( /*event, context, callback*/ ) {

                return new Promise( function( resolve, reject ) {

                    setTimeout( function() {

                        reject( new Error( 'bang' ) );

                    }, 200 );
                });
            });

            return LambdaTester( handler )
                .expectError( function( err ) {

                    expect( err.message ).to.equal( 'bang' );
                });
        });

        it( 'uncaught exceptions', function() {

            let vandium = require( VANDIUM_MODULE_PATH );

            const handler = vandium( function( /*event, context, callback*/ ) {

                throw new Error( 'bang' );
            });

            return LambdaTester( handler )
                .expectError( function( err ) {

                    expect( err.message ).to.equal( 'bang' );
                });
        });

        it( 'uncaught exceptions - disable logging', function() {

            let vandium = require( VANDIUM_MODULE_PATH );
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

            let vandium = require( VANDIUM_MODULE_PATH );

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

            let vandium = require( VANDIUM_MODULE_PATH );

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

            preventRestorer.restore();

            process.env.VANDIUM_PREVENT_EVAL = 'true';

            let vandium = require( VANDIUM_MODULE_PATH );

            const handler = vandium( function( event, context ) {

                eval( 'let x = 5;' );

                context.succeed( 'ok' );
            });

            return LambdaTester( handler )
                .expectResult( function( result ) {

                    expect( result ).to.equal( 'ok' );

                    delete process.env.VANDIUM_PREVENT_EVAL;
                });
        });

        it( 'fail: simple wrap with no jwt or validation, eval prevented', function() {

            preventRestorer.restore();

            let vandium = require( VANDIUM_MODULE_PATH );

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

            let vandium = require( VANDIUM_MODULE_PATH );

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

            let vandium = require( VANDIUM_MODULE_PATH );

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

            let vandium = require( VANDIUM_MODULE_PATH );

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

            let vandium = require( VANDIUM_MODULE_PATH );

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

            let vandium = require( VANDIUM_MODULE_PATH );

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

            let vandium = require( VANDIUM_MODULE_PATH );

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

            let vandium = require( VANDIUM_MODULE_PATH );

            vandium.after( function() { throw new Error( 'bang' ); } );

            const handler = vandium( function() {

                return Promise.resolve( 'ok' );
            });

            return LambdaTester( handler )
                .expectResult( function( result ) {

                    expect( result ).to.equal( 'ok' );
                });
        });
	});

    describe( '.jwt', function() {

        it( 'normal operation', function() {

            let vandium = require( VANDIUM_MODULE_PATH );

            let jwt = vandium.jwt();

            let state = require( '../../lib/state' );

            // stage vars should be enabled by default
            expect( state.current.jwt ).to.eql( { enabled: false, key: undefined, algorithm: undefined, tokenName: 'jwt' } );

            vandium.jwt().configure( { algorithm: 'HS256', secret: 'my-secret' } );
            expect( state.current.jwt ).to.eql( { enabled: true, key: 'my-secret', algorithm: 'HS256', tokenName: 'jwt' } );
            expect( vandium.jwt().isEnabled() ).to.be.true;

            // should still be set
            jwt = vandium.jwt();
            expect( state.current.jwt ).to.eql( { enabled: true, key: 'my-secret', algorithm: 'HS256', tokenName: 'jwt' } );
        });
    });

    describe( '.validation', function() {

        it( 'normal operation', function() {

            let vandium = require( VANDIUM_MODULE_PATH );

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

            let vandium = require( VANDIUM_MODULE_PATH );

            expect( vandium.validator ).to.exist;

            // future: will need to change to allow other validators to be present
            expect( vandium.validator ).to.equal( require( 'joi' ) );
        });
    });

    describe( 'auto-configure', function() {

        before( function( done ) {

            configUtils.removeConfig( done );
        });

        after( function( done ) {

            configUtils.removeConfig( done );
        });

        it( 'auto update when vandium.json is present', function( done ) {

            configUtils.writeConfig( JSON.stringify( { jwt: { algorithm: 'HS256', secret: 'my-secret' } }), function( err ) {

                if( err ) {

                    return done( err );
                }

                let vandium = require( VANDIUM_MODULE_PATH );

                const config = require( '../../lib/config' );

                // wait for config to load
                config.wait( function() {

                    let token = jwtBuilder( { user: 'fred', secret: 'my-secret', algorithm: 'HS256' } );

                    const handler = vandium( function( event, context ) {

                        context.succeed( event.jwt.claims.user );
                    });

                    LambdaTester( handler )
                        .event( { jwt: token } )
                        .expectResult( function( result ) {

                            expect( result ).to.equal( 'fred' );
                            done();
                        })
                        .catch( done );
                });
            });
        });
    });
});
