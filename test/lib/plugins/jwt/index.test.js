'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const sinon = require( 'sinon' );

const proxyquire = require( 'proxyquire' ).noCallThru();

const envRestorer = require( 'env-restorer' );

const JWTPlugin = require( '../../../../lib/plugins/jwt/index' );

const DEFAULT_CONFIGURATION_STATE = { enabled: false };

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

        xdescribe( 'config.on( "update" )', function() {

            [
                [ 'valid config', { algorithm: 'HS256' } ],
                [ 'empty config', {} ]
            ].forEach( function( testCase ) {

                it( testCase[0], function() {

                    loadModule();

                    expect( configStub.on.calledOnce ).to.be.true;
                    expect( configStub.on.withArgs( 'update' ).calledOnce ).to.be.true;

                    let updateFunction = configStub.on.firstCall.args[1];

                    expect( updateFunction ).to.be.instanceof( Function );

                    configuration.update.reset();

                    configStub.jwt = testCase[1];

                    // invoke
                    updateFunction();

                    expect( configuration.update.calledOnce ).to.be.true;
                    expect( configuration.update.withArgs( configStub.jwt ).calledOnce ).to.be.true;

                    // empty
                    configuration.update.reset();

                    configStub.jwt = {};

                    updateFunction();

                    expect( configuration.update.calledOnce ).to.be.true;
                    expect( configuration.update.withArgs( configStub.jwt ).calledOnce ).to.be.true;
                });
            });

            it( 'no config', function() {

                loadModule();

                expect( configStub.on.calledOnce ).to.be.true;
                expect( configStub.on.withArgs( 'update' ).calledOnce ).to.be.true;

                let updateFunction = configStub.on.firstCall.args[1];

                expect( updateFunction ).to.be.instanceof( Function );

                configuration.update.reset();

                delete configStub.jwt;

                // invoke
                updateFunction();

                expect( configuration.update.calledOnce ).to.be.false;
            });
        });
    });

    xdescribe( 'module.exports', function() {

        let jwt;

        beforeEach( function() {

            jwt = loadModule();
        });

        describe( '.configure', function() {

            it( 'with options', function() {

                let options = { algorithm: 'RS256' };
                let state = { enabled: true, algorithm: 'RS256' };

                configuration.state.returns( state );

                jwt.configure( options );

                expect( configuration.update.withArgs( options ).calledOnce ).to.be.true;
                expect( stateRecorder.record.withArgs( state ).calledOnce ).to.be.true;
            });

            it( 'with empty options', function() {

                let options = {};
                let state = { enabled: true };

                configuration.state.returns( state );

                jwt.configure( options );

                expect( configuration.update.withArgs( options ).calledOnce ).to.be.true;
                expect( stateRecorder.record.withArgs( state ).calledOnce ).to.be.true;
            });

            it( 'no options', function() {

                let state = { enabled: true };

                configuration.state.returns( state );

                jwt.configure();

                expect( configuration.update.withArgs( {} ).calledOnce ).to.be.true;
                expect( stateRecorder.record.withArgs( state ).calledOnce ).to.be.true;
            });
        });

        describe( '.enable', function() {

            it( 'normal operation', function() {

                let state = { enabled: true };

                configuration.state.returns( state );

                jwt.enable();

                expect( configuration.update.withArgs( {} ).calledOnce ).to.be.true;
                expect( stateRecorder.record.withArgs( state ).calledOnce ).to.be.true;
            });
        });

        describe( '.isEnabled', function() {

            it( 'normal operation', function() {

                expect( configuration.isEnabled.called ).to.be.false;

                configuration.isEnabled.returns( true );

                expect( jwt.isEnabled() ).to.be.true;

                expect( configuration.isEnabled.calledOnce ).to.be.true;
                expect( configuration.isEnabled.withArgs().calledOnce ).to.be.true;
            });
        });

        describe( '.validate', function() {

            it( 'normal operation', function() {

                let event = { one: 1, jwt: 'my-jwt' };

                expect( validatorStub.validate.called ).to.be.false;

                configuration.getIgnoredProperties.returns( [ 'jwt' ] );

                let pipelineEvent = { event, ignored: [] };

                jwt.validate( pipelineEvent );

                expect( validatorStub.validate.calledOnce ).to.be.true;
                expect( validatorStub.validate.withArgs( event, configuration ).calledOnce ).to.be.true;

                expect( configuration.getIgnoredProperties.calledOnce ).to.be.true;
                expect( configuration.getIgnoredProperties.withArgs( event ).calledOnce ).to.be.true;

                expect( pipelineEvent.ignored ).to.eql( [ 'jwt' ] );
            });

            it( 'normal operation, no ignore keys', function() {

                let event = { one: 1, jwt: 'my-jwt' };

                expect( validatorStub.validate.called ).to.be.false;

                configuration.getIgnoredProperties.returns();

                let pipelineEvent = { event, ignored: [] };

                jwt.validate( pipelineEvent );

                expect( validatorStub.validate.calledOnce ).to.be.true;
                expect( validatorStub.validate.withArgs( event, configuration ).calledOnce ).to.be.true;

                expect( configuration.getIgnoredProperties.calledOnce ).to.be.true;
                expect( configuration.getIgnoredProperties.withArgs( event ).calledOnce ).to.be.true;

                expect( pipelineEvent.ignored ).to.eql( [] );
            });
        });
    });
});
