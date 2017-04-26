'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const proxyquire = require( 'proxyquire' );

const sinon = require( 'sinon' );

const MODULE_PATH = 'lib/event_types/api/jwt';

const envRestorer = require( 'env-restorer' );

describe( MODULE_PATH, function() {

    let JWTValidator;

    let jwtStub;

    beforeEach( function() {

        // restore all env vars to defaults
        envRestorer.restore();

        jwtStub = {

            decode: sinon.stub(),

            validateXSRF: sinon.stub()
        };

        JWTValidator = proxyquire( '../../../../' + MODULE_PATH, {

            '../../jwt': jwtStub
        });
    });

    describe( 'JWTValidator', function() {

        describe( 'constructor', function() {

            it( 'no options, no env vars set', function() {

                let instance = new JWTValidator();

                expect( instance ).to.be.instanceof( JWTValidator );
                expect( instance.enabled ).to.be.false;
            });

            it( 'enabled = false', function() {

                let instance = new JWTValidator( { enabled: false } );

                expect( instance ).to.be.instanceof( JWTValidator );
                expect( instance.enabled ).to.be.false;
            });

            it( 'no options, env vars set for algorithm and secret', function() {

                process.env.VANDIUM_JWT_ALGORITHM = 'HS256';
                process.env.VANDIUM_JWT_SECRET = 'super-secret';

                let instance = new JWTValidator();

                expect( instance.enabled ).to.be.true;
                expect( instance.algorithm ).to.equal( 'HS256' );
                expect( instance.key ).to.equal( 'super-secret' );
                expect( instance.tokenPath ).to.eql( [ 'headers', 'jwt' ] );
                expect( instance.xsrf ).to.be.false;
            });

            it( 'no options, env vars set for algorithm and key', function() {

                process.env.VANDIUM_JWT_ALGORITHM = 'HS256';
                process.env.VANDIUM_JWT_KEY = 'super-secret';

                let instance = new JWTValidator();

                expect( instance.enabled ).to.be.true;
                expect( instance.algorithm ).to.equal( 'HS256' );
                expect( instance.key ).to.equal( 'super-secret' );
                expect( instance.tokenPath ).to.eql( [ 'headers', 'jwt' ] );
                expect( instance.xsrf ).to.be.false;
            });

            it( 'no options, env vars set for algorithm and publicKey', function() {

                process.env.VANDIUM_JWT_ALGORITHM = 'RS256';
                process.env.VANDIUM_JWT_PUBKEY = 'super-secret';

                let instance = new JWTValidator();

                expect( instance.enabled ).to.be.true;
                expect( instance.algorithm ).to.equal( 'RS256' );
                expect( instance.key ).to.equal( 'super-secret' );
                expect( instance.tokenPath ).to.eql( [ 'headers', 'jwt' ] );
                expect( instance.xsrf ).to.be.false;
            });

            it( 'no options, env vars set for algorithm (RS256) and key', function() {

                process.env.VANDIUM_JWT_ALGORITHM = 'RS256';
                process.env.VANDIUM_JWT_KEY = 'super-secret';

                let instance = new JWTValidator();

                expect( instance.enabled ).to.be.true;
                expect( instance.algorithm ).to.equal( 'RS256' );
                expect( instance.key ).to.equal( 'super-secret' );
                expect( instance.tokenPath ).to.eql( [ 'headers', 'jwt' ] );
                expect( instance.xsrf ).to.be.false;
            });

            it( 'no options, all env vars xsrf = true', function() {

                process.env.VANDIUM_JWT_ALGORITHM = 'HS256';
                process.env.VANDIUM_JWT_SECRET = 'super-secret';
                process.env.VANDIUM_JWT_USE_XSRF = 'TRUE';

                let instance = new JWTValidator();

                expect( instance.enabled ).to.be.true;
                expect( instance.algorithm ).to.equal( 'HS256' );
                expect( instance.key ).to.equal( 'super-secret' );
                expect( instance.tokenPath ).to.eql( [ 'headers', 'jwt' ] );
                expect( instance.xsrf ).to.be.true;
                expect( instance.xsrfTokenPath ).to.eql( [ 'headers', 'xsrfToken' ] );
                expect( instance.xsrfClaimName ).to.equal( 'xsrfToken' );
            });

            it( 'no options, all env vars set including xsrf', function() {

                process.env.VANDIUM_JWT_ALGORITHM = 'HS256';
                process.env.VANDIUM_JWT_SECRET = 'super-secret';
                process.env.VANDIUM_JWT_USE_XSRF = 'TRUE';
                process.env.VANDIUM_JWT_XSRF_TOKEN_PATH = 'queryParamters.xsrf';
                process.env.VANDIUM_JWT_XSRF_CLAIM_NAME = 'my-xsrf-token';
                process.env.VANDIUM_JWT_TOKEN_PATH = 'queryParamters.jwt';

                let instance = new JWTValidator();

                expect( instance.enabled ).to.be.true;
                expect( instance.algorithm ).to.equal( 'HS256' );
                expect( instance.key ).to.equal( 'super-secret' );
                expect( instance.tokenPath ).to.eql( [ 'queryParamters', 'jwt' ] );
                expect( instance.xsrf ).to.be.true;
                expect( instance.xsrfTokenPath ).to.eql( [ 'queryParamters', 'xsrf' ] );
                expect( instance.xsrfClaimName ).to.equal( 'my-xsrf-token' );
            });

            it( 'configure with options for HS algorithm with secret', function() {

                let instance = new JWTValidator( {

                    algorithm: 'HS384',
                    secret: 'my-super-secret',
                    token: 'headers.JWT',
                    xsrf: true,
                    xsrfToken: 'headers.XSRF',
                    xsrfClaimName: 'xsrfHere'
                });

                expect( instance.enabled ).to.be.true;
                expect( instance.algorithm ).to.equal( 'HS384' );
                expect( instance.key ).to.equal( 'my-super-secret' );
                expect( instance.tokenPath ).to.eql( [ 'headers', 'JWT' ] );
                expect( instance.xsrf ).to.be.true;
                expect( instance.xsrfTokenPath ).to.eql( [ 'headers', 'XSRF' ] );
                expect( instance.xsrfClaimName ).to.equal( 'xsrfHere' );
            });

            it( 'configure with options for RS algorithm with secret', function() {

                let instance = new JWTValidator( {

                    algorithm: 'RS256',
                    publicKey: 'my-pub-key',
                    token: 'headers.JWT',
                    xsrf: true,
                    xsrfToken: 'headers.XSRF',
                    xsrfClaimName: 'xsrfHere'
                });

                expect( instance.enabled ).to.be.true;
                expect( instance.algorithm ).to.equal( 'RS256' );
                expect( instance.key ).to.equal( 'my-pub-key' );
                expect( instance.tokenPath ).to.eql( [ 'headers', 'JWT' ] );
                expect( instance.xsrf ).to.be.true;
                expect( instance.xsrfTokenPath ).to.eql( [ 'headers', 'XSRF' ] );
                expect( instance.xsrfClaimName ).to.equal( 'xsrfHere' );
            });

            it( 'fail when secret key is missing', function() {

                process.env.VANDIUM_JWT_ALGORITHM = 'HS256';

                try {

                    new JWTValidator();

                    throw new Error( 'should not get here' );
                }
                catch( err ) {

                    expect( err.message ).to.equal( 'missing required jwt configuration value: secret' );
                }
            });

            it( 'fail when public key is missing', function() {

                process.env.VANDIUM_JWT_ALGORITHM = 'RS256';

                try {

                    new JWTValidator();

                    throw new Error( 'should not get here' );
                }
                catch( err ) {

                    expect( err.message ).to.equal( 'missing required jwt configuration value: publicKey' );
                }
            });
        });

        describe( '.validate', function() {

            it( 'jwt disabled', function() {

                let instance = new JWTValidator();

                let event = {};

                instance.validate( event );

                expect( event ).to.eql( {} );

                expect( jwtStub.decode.called ).to.be.false;
                expect( jwtStub.validateXSRF.called ).to.be.false;
            });

            it( 'jwt enabled, no xsrf', function() {

                let instance = new JWTValidator( {

                    algorithm: 'HS256',
                    key: 'super-secret'
                });

                let event = {

                    headers: {

                        jwt: 'jwt-here'
                    }
                };

                const decoded = { claim1: 1, claim2: 2 };

                jwtStub.decode.returns( decoded );

                instance.validate( event );

                expect( jwtStub.decode.calledOnce ).to.be.true;
                expect( jwtStub.decode.firstCall.args ).to.eql( [ 'jwt-here', 'HS256', 'super-secret' ] );

                expect( jwtStub.validateXSRF.called ).to.be.false;

                expect( event.jwt ).to.exist;
                expect( event.jwt ).to.eql( decoded );
            });

            it( 'jwt enabled, with xsrf', function() {

                let instance = new JWTValidator( {

                    algorithm: 'HS256',
                    key: 'super-secret',
                    xsrf: true,
                    xsrfToken: 'headers.xsrf'
                });

                let event = {

                    headers: {

                        jwt: 'jwt-here',
                        xsrf: 'xsrfTokenHere'
                    }
                };

                const decoded = { claim1: 1, claim2: 2 };

                jwtStub.decode.returns( decoded );

                instance.validate( event );

                expect( jwtStub.decode.calledOnce ).to.be.true;
                expect( jwtStub.decode.firstCall.args ).to.eql( [ 'jwt-here', 'HS256', 'super-secret' ] );

                expect( jwtStub.validateXSRF.calledOnce ).to.be.true;

                expect( jwtStub.validateXSRF.firstCall.args ).to.eql( [ decoded, 'xsrfTokenHere', 'xsrfToken' ] );

                expect( event.jwt ).to.exist;
                expect( event.jwt ).to.eql( decoded );
            });
        });
    });
});
