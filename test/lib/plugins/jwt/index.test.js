'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const sinon = require( 'sinon' );

const proxyquire = require( 'proxyquire' ).noCallThru();

const envRestorer = require( 'env-restorer' );

const JWT_MODULE_PATH = '../../../../lib/plugins/jwt/index';

const DEFAULT_CONFIGURATION_STATE = { enabled: false };

describe( 'lib/plugins/jwt/index', function() {

    let configStub;

    let configurationStub;

    let validatorStub;

    let stateStub;

    let configuration;

    let stateRecorder;

    beforeEach( function() {

        envRestorer.restore();

        configuration = {

            isEnabled: sinon.stub(),

            update: sinon.stub(),

            getIgnoredProperties: sinon.stub(),

            state: sinon.stub().returns( DEFAULT_CONFIGURATION_STATE )
        };

        configurationStub = sinon.stub().returns( configuration );

        stateRecorder = {

            record: sinon.stub()
        };

        stateStub = {

            recorder: sinon.stub().returns( stateRecorder ),

            record: sinon.stub()
        };

        validatorStub = {

            validate: sinon.stub()
        };

        configStub = {

            on: sinon.stub()
        }
    });

    after( function() {

        envRestorer.restore();
    });

    function loadModule() {

        let jwt = proxyquire( JWT_MODULE_PATH, {

                './configuration': configurationStub,

                '../../state': stateStub,

                './validator': validatorStub,

                '../../config': configStub
            });

        return jwt;
    }

    describe( 'internals', function() {

        describe( '.stateRecorder', function() {

            it( 'normal operation', function() {

                loadModule();

                expect( stateStub.recorder.calledOnce ).to.be.true;
                expect( stateStub.recorder.withArgs( 'jwt' ).calledOnce ).to.be.true;

                expect( stateRecorder.record.calledOnce ).to.be.true;
                expect( stateRecorder.record.withArgs( DEFAULT_CONFIGURATION_STATE ).calledOnce ).to.be.true;
            });
        });

        describe( '.configureFromEnvVars', function() {

            it( 'without env vars declared', function() {

                loadModule();

                // nothing
                expect( configuration.update.called ).to.be.false;

                expect( configStub.on.calledOnce ).to.be.true;
                expect( configStub.on.withArgs( 'update' ).calledOnce ).to.be.true;
            });


            [
                {
                    description: 'with single env var',
                    env: { VANDIUM_JWT_ALGORITHM: 'HS256' },
                    updateValues: {
                        algorithm: 'HS256',
                    }
                },
                {
                    description: 'xrf = true',
                    env: { VANDIUM_JWT_USE_XSRF: true },
                    updateValues: {
                        xsrf: true,
                    }
                },
                {
                    description: 'xrf = "true"',
                    env: { VANDIUM_JWT_USE_XSRF: "true" },
                    updateValues: {
                        xsrf: true,
                    }
                },
                {
                    description: 'xrf = "false"',
                    env: { VANDIUM_JWT_USE_XSRF: "false" },
                    updateValues: {
                        xsrf: false,
                    }
                },
                {
                    description: 'xrf = false',
                    env: { VANDIUM_JWT_USE_XSRF: false },
                    updateValues: {
                        xsrf: false,
                    }
                },
                {
                    description: 'all values',
                    env: {
                        VANDIUM_JWT_ALGORITHM: 'HS256',
                        VANDIUM_JWT_SECRET: 'my-secret',
                        VANDIUM_JWT_PUBKEY: 'my-public-key',    // legal because there's no checking here!
                        VANDIUM_JWT_TOKEN_NAME: 'JWT',
                        VANDIUM_JWT_USE_XSRF: 'yes',
                        VANDIUM_JWT_XSRF_TOKEN_NAME: 'xsrf',
                        VANDIUM_JWT_XSRF_CLAIM_NAME: 'xsrfToken'
                    },
                    updateValues: {
                        algorithm: 'HS256',
                        secret: 'my-secret',
                        public_key: 'my-public-key',
                        token_name: 'JWT',
                        xsrf: true,
                        xsrf_token_name: 'xsrf',
                        xsrf_claim_name: 'xsrfToken'
                    }
                },
            ].forEach( function( test ) {

                it( test.description, function() {

                    for( let key in test.env ) {

                        process.env[ key ] = test.env[ key ];
                    }

                    loadModule();

                    expect( configuration.update.calledOnce ).to.be.true;
                    expect( configuration.update.withArgs( test.updateValues ).calledOnce ).to.be.true;

                    // once for load, once for config
                    expect( stateRecorder.record.calledTwice ).to.be.true;
                    expect( stateRecorder.record.withArgs( DEFAULT_CONFIGURATION_STATE ).calledTwice ).to.be.true;

                    expect( configStub.on.calledOnce ).to.be.true;
                    expect( configStub.on.withArgs( 'update' ).calledOnce ).to.be.true;
                });
            });
        });

        describe( 'config.on( "update" )', function() {

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

    describe( 'module.exports', function() {

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
