'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const sinon = require( 'sinon' );

const jwtBuilder = require( 'jwt-builder' );

const envRestorer = require( 'env-restorer' );

const JWTPlugin = require( '../../../../lib/plugins/jwt/index' );

describe( 'lib/plugins/jwt/index', function() {

    describe( 'JWTPlugin', function() {

        describe( 'constructor', function() {

            beforeEach( function() {

                delete process.env.VANDIUM_JWT_ALGORITHM;
                delete process.env.VANDIUM_JWT_SECRET;
                delete process.env.VANDIUM_JWT_PUBKEY;
                delete process.env.VANDIUM_JWT_TOKEN_NAME;
                delete process.env.VANDIUM_JWT_USE_XSRF;
                delete process.env.VANDIUM_JWT_XSRF_TOKEN_NAME;
                delete process.env.VANDIUM_JWT_XSRF_CLAIM_NAME;
            });

            afterEach( function() {

                envRestorer.restore();
            });

            it( 'without env vars declared', function() {

                let plugin = new JWTPlugin();

                expect( plugin.state ).to.eql( { enabled: false } );
            });


            [
                {
                    description: 'with single env var',
                    env: { VANDIUM_JWT_ALGORITHM: 'HS256' },
                    expectedState: {
                        algorithm: 'HS256',
                        enabled: true,
                        tokenName: 'jwt',
                        xsrf: false,
                    }
                },
                {
                    description: 'xrf = true',
                    env: { VANDIUM_JWT_USE_XSRF: true },
                    expectedState: {
                        enabled: true,
                        tokenName: 'jwt',
                        xsrf: true,
                        xsrfToken: 'xsrfToken',
                        xsrfClaimName: 'xsrfToken'
                    }
                },
                {
                    description: 'xrf = "true"',
                    env: { VANDIUM_JWT_USE_XSRF: "true" },
                    expectedState: {
                        enabled: true,
                        tokenName: 'jwt',
                        xsrf: true,
                        xsrfToken: 'xsrfToken',
                        xsrfClaimName: 'xsrfToken'
                    }
                },
                {
                    description: 'xrf = "false"',
                    env: { VANDIUM_JWT_USE_XSRF: "false" },
                    expectedState: {
                        enabled: true,
                        tokenName: 'jwt',
                        xsrf: false,
                    }
                },
                {
                    description: 'xrf = false',
                    env: { VANDIUM_JWT_USE_XSRF: false },
                    expectedState: {
                        enabled: true,
                        tokenName: 'jwt',
                        xsrf: false,
                    }
                },
                {
                    description: 'all values',
                    env: {
                        VANDIUM_JWT_ALGORITHM: 'RS256',
                        VANDIUM_JWT_SECRET: 'my-secret',
                        VANDIUM_JWT_PUBKEY: 'my-public-key',    // legal because there's no checking here!
                        VANDIUM_JWT_TOKEN_NAME: 'JWT',
                        VANDIUM_JWT_USE_XSRF: 'yes',
                        VANDIUM_JWT_XSRF_TOKEN_NAME: 'xsrf',
                        VANDIUM_JWT_XSRF_CLAIM_NAME: 'xsrfToken'
                    },
                    expectedState: {
                        enabled: true,
                        algorithm: 'RS256',
                        key: 'my-public-key',
                        tokenName: 'JWT',
                        xsrf: true,
                        xsrfToken: 'xsrf',
                        xsrfClaimName: 'xsrfToken'
                    }
                },
            ].forEach( function( test ) {

                it( "env vars set - " + test.description, function() {

                    for( let key in test.env ) {

                        process.env[ key ] = test.env[ key ];
                    }

                    let plugin = new JWTPlugin();

                    expect( plugin.state ).to.eql( test.expectedState );
                });
            });
        });

        describe( '.configure', function() {

            it( 'normal operation', function() {

                let plugin = new JWTPlugin();

                expect( plugin.state.enabled ).to.be.false;

                expect( plugin.configuration ).to.exist;

                let configurationUpdateSpy = sinon.spy( plugin.configuration, 'update' );

                let config = {

                    algorithm: 'HS256',
                    secret: 'my-secret'
                };

                plugin.configure( config );

                expect( configurationUpdateSpy.calledOnce ).to.be.true;
                expect( configurationUpdateSpy.withArgs( config ).calledOnce ).to.be.true;

                expect( plugin.state ).to.eql( {

                    enabled: true,
                    key: 'my-secret',
                    algorithm: 'HS256',
                    tokenName: 'jwt',
                    xsrf: false
                });
            });
        });

        describe( '.getConfiguration', function() {

            it( 'normal operation', function() {

                let plugin = new JWTPlugin();

                plugin.configure( {

                    algorithm: 'HS256',
                    secret: 'my-secret'
                });

                expect( plugin.getConfiguration() ).to.eql( {

                    enable: true,
                    algorithm: 'HS256',
                    secret: 'my-secret'
                });
            });
        });

        describe( '.state', function() {

            it( 'normal operation', function() {

                let plugin = new JWTPlugin();

                expect( plugin.state ).to.eql( { enabled: false } );
                expect( plugin.state ).to.eql( plugin.configuration.state );

                let config = {

                    algorithm: 'HS256',
                    secret: 'my-secret'
                };

                plugin.configure( config );

                expect( plugin.state ).to.eql( {

                    enabled: true,
                    key: 'my-secret',
                    algorithm: 'HS256',
                    tokenName: 'jwt',
                    xsrf: false
                });

                expect( plugin.state ).to.eql( plugin.configuration.state );

                plugin.configure( {} );

                expect( plugin.state ).to.eql( { enabled: false } );
                expect( plugin.state ).to.eql( plugin.configuration.state );
            });
        });

        describe( '.isEnabled', function() {

            it( 'normal operation', function() {

                let plugin = new JWTPlugin();

                expect( plugin.isEnabled() ).to.be.false;
                expect( plugin.state.enabled ).to.be.false;

                let config = {

                    algorithm: 'HS256',
                    secret: 'my-secret'
                };

                plugin.configure( config );

                expect( plugin.isEnabled() ).to.be.true;
                expect( plugin.state.enabled ).to.be.true;

                plugin.configure( {} );

                expect( plugin.isEnabled() ).to.be.false;
                expect( plugin.state.enabled ).to.be.false;
            });
        });

        describe( '.execute', function() {

            it( 'normal operation, jwt processing disabled', function( done ) {

                const token = 'token-goes-here!!!';

                let event = { one: 1, jwt: token };

                let pipelineEvent = { event, ignored: [] };

                let plugin = new JWTPlugin();

                plugin.execute( pipelineEvent, function( err ) {

                    expect( pipelineEvent.event.jwt ).to.equal( token );

                    expect( pipelineEvent.ignored ).to.eql( [] );

                    done( err );
                });
            });

            it( 'normal operation, jwt processing enabled', function( done ) {

                const token = jwtBuilder( { user: 'fred', secret: 'super-secret', algorithm: 'HS256' } );

                let event = { one: 1, jwt: token };

                let pipelineEvent = { event, ignored: [] };

                let plugin = new JWTPlugin();

                plugin.configure( { algorithm: 'HS256', secret: 'super-secret' } );

                plugin.execute( pipelineEvent, function( err ) {

                    expect( pipelineEvent.event.jwt ).to.be.an( 'Object' );
                    expect( pipelineEvent.event.jwt.token ).to.equal( token );
                    expect( pipelineEvent.event.jwt.claims ).to.eql( { user: 'fred' } );

                    expect( pipelineEvent.ignored ).to.eql( [ 'jwt' ] );

                    done( err );
                });
            });

            it( 'normal operation, jwt processing enabled with xsrf', function( done ) {

                const token = jwtBuilder( { user: 'fred', secret: 'super-secret', algorithm: 'HS256', xsrfToken: '1234' } );

                let event = { one: 1, jwt: token, xsrfToken: '1234' };

                let pipelineEvent = { event, ignored: [] };

                let plugin = new JWTPlugin();

                plugin.configure( { algorithm: 'HS256', secret: 'super-secret', xsrf: true } );

                plugin.execute( pipelineEvent, function( err ) {

                    if( err ) {

                        return done( err );
                    }

                    expect( pipelineEvent.event.jwt ).to.be.an( 'Object' );
                    expect( pipelineEvent.event.jwt.token ).to.equal( token );
                    expect( pipelineEvent.event.jwt.claims ).to.eql( { user: 'fred', xsrfToken: '1234' } );

                    expect( pipelineEvent.ignored ).to.eql( [ 'jwt', 'xsrfToken' ] );

                    done( err );
                });
            });

            it( 'fail: jwt processing failed', function( done ) {

                const token = jwtBuilder( { user: 'fred', secret: 'super-secret', algorithm: 'HS256', xsrfToken: '123456' } );

                let event = { one: 1, jwt: token, xsrfToken: '1234' };

                let pipelineEvent = { event, ignored: [] };

                let plugin = new JWTPlugin();

                plugin.configure( { algorithm: 'HS256', secret: 'super-secret', xsrf: true } );

                plugin.execute( pipelineEvent, function( err ) {

                    expect( err ).to.exist;
                    expect( err.message.startsWith( 'authentication error:' ) ).to.be.true;

                    done();
                });
            });
        });
    });
});
