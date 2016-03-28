'use strict';

var expect = require( 'chai' ).expect;

var Promise = require( 'bluebird' );

var freshy = require( 'freshy' );

var jwtSimple = require( 'jwt-simple' );

var sinon = require( 'sinon' );

var configUtils = require( './lib/config-utils' );

function makeSuccessContext( done, expected ) {

    if( !expected ) {

        expected = 'ok';
    }

    return {

        succeed: function( result ) {

            expect( result ).to.eql( expected );

            done(); 
        },

        fail: function( err ) {

            done( err );
        }
    };
}

function makeFailContext( done ) {

    return  {

        succeed: function( result ) {

                done( new Error( 'should not succeed' ) );
            },

        fail: function( err ) {

            expect( err ).to.be.an.instanceof( Error );

            done();
        }
    };
}

describe( 'index', function() {

    var vandium;

    before( function( done ) {

        configUtils.removeConfig( done );
    });

    after( function( done ) {

        configUtils.removeConfig( done );
    });

    beforeEach( function() {

        freshy.unload( '../index' );
        freshy.unload( '../lib/config' );
        freshy.unload( '../lib/jwt' );
    });

	describe( '.vandium', function( done ) {

		it( 'simple wrap with no jwt or validation', function( done ) {

            vandium = require( '../index' );

            var handler = vandium( function( event, context ) {

                context.succeed( 'ok' );
            });

            handler( {}, makeSuccessContext( done ) );
        });

        it( 'simple wrap, return value', function() {

            vandium = require( '../index' );

            var handler = vandium( function( event, context ) {

                context.succeed( 'ok' );

                return 42;
            });

            var context = {

                succeed: sinon.stub(),

                fail: sinon.stub
            };

            expect( handler( {}, context ) ).to.equal( 42 );
            expect( context.succeed.calledOnce ).to.be.true;
            expect( context.succeed.withArgs( 'ok').calledOnce ).to.be.true;
        });

        it( 'simple validation', function( done ) {

            vandium = require( '../index' );

            vandium.validation( {

                name: vandium.types.string().required(),

                age: vandium.types.number().min( 0 ).max( 120 ).required(),

                jwt: vandium.types.any()
            });

            vandium.jwt().configure( {

                algorithm: 'HS256',
                secret: 'super-secret' 
            });

            var handler = vandium( function( event, context ) {

                context.succeed( 'ok' );
            });

            var token = jwtSimple.encode( { user: 'fred' }, 'super-secret', 'HS256' );

            handler( { name: 'fred', age: 16, jwt: token }, makeSuccessContext( done ) );
        });

        it( 'simple validation with sql injection protection', function( done ) {

            vandium = require( '../index' );

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

            var handler = vandium( function( event, context ) {

                context.succeed( 'ok' );
            });

            var token = jwtSimple.encode( { user: 'fred' }, 'super-secret', 'HS256' );

            handler( { name: 'fred', age: 16, jwt: token }, makeSuccessContext( done ) );
        });

        it( 'validation where value is missing', function( done ) {

            vandium = require( '../index' );

            vandium.validation( {

                name: vandium.types.string().required(),

                age: vandium.types.number().min( 0 ).max( 120 ).required()
            })

            var handler = vandium( function( event, context ) {

                context.succeed( 'ok' );
            });

            handler( { name: 'fred' }, makeFailContext( done ) );
        });

        it( 'handle resolve from a promise', function( done ) {

            vandium = require( '../index' );

            var handler = vandium( function( event, context ) {

                return new Promise( function( resolve, reject ) {

                    setTimeout( function() {

                        resolve( 'ok' );

                    }, 200 );
                });
            });

            handler( { }, makeSuccessContext( done ) );
        });

        it( 'handle reject from a promise', function( done ) {

            vandium = require( '../index' );

            var handler = vandium( function( event, context ) {

                return new Promise( function( resolve, reject ) {

                    setTimeout( function() {

                        reject( new Error( 'bang' ) );

                    }, 200 );
                });
            });

            handler( { }, makeFailContext( done ) );        
        });
	});

    describe( '.jwt', function() {

        it( 'normal operation', function() {

            vandium = require( '../index' );

            var jwt = vandium.jwt();

            // stage vars should be enabled by default
            expect( jwt.configuration() ).to.eql( { key: undefined, algorithm: undefined, tokenName: 'jwt', stageVars: true } );
            
            var jwtConfig = vandium.jwt().configure( { algorithm: 'HS256', secret: 'my-secret' } );
            expect( jwtConfig ).to.eql( { key: 'my-secret', algorithm: 'HS256', tokenName: 'jwt', stageVars: false } );

            // should still be set
            jwt = vandium.jwt();
            expect( jwt.configuration() ).to.eql( { key: 'my-secret', algorithm: 'HS256', tokenName: 'jwt', stageVars: false } );
        });
    });

    describe( '.validation', function() {

        it( 'normal operation', function() {

            vandium = require( '../index' );

            // no params should be ok
            vandium.validation();

            // call again with schema
            vandium.validation( {

                name: vandium.types.string()
            });
        });
    });

    describe( 'auto-configure', function() {

        var originalConfigData;

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

                vandium = require( '../index' );

                var config = require( '../lib/config' );

                // wait for config to load
                config.wait( function() {

                    var token = jwtSimple.encode( { user: 'fred' }, 'my-secret', 'HS256' );

                    var handler = vandium( function( event, context ) {

                        context.succeed( event.jwt.claims.user );
                    });

                    handler( { jwt: token }, makeSuccessContext( done, 'fred' ) );
                }); 
            });
        });
    });
});
