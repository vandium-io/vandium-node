'use strict';

/*jshint expr: true*/

var expect = require( 'chai' ).expect;

// will set LAMBDA_TASK_ROOT
require( 'lambda-tester' );

var freshy = require( 'freshy' );

var NodeRSA = require('node-rsa');

var jwtSimple = require('jwt-simple');

var jwt = require( '../../lib/jwt' );

var ALGORITHMS = [ 'HS256', 'HS384', 'HS512', 'RS256' ];

var configUtils = require( './config-utils' );

const CONFIG_MODULE_PATH = '../../lib/config';

const JWT_MODULE_PATH = '../../lib/jwt';

const STATE_MODULE_PATH = '../../lib/state';

//var logger = require( '../../lib/logger' ).setLevel( 'debug' );

describe( 'lib/jwt', function() {

    function writeConfigData( configData, callback ) {

        configUtils.writeConfig( configData, callback );
    }

    let pubKey;
    let privKey;

    let state;

    before( function( done ) {

        var RSAKey = new NodeRSA({b: 512});

        var keyPair = RSAKey.generateKeyPair( 512 );

        privKey = keyPair.exportKey( 'private' );
        pubKey = keyPair.exportKey( 'public' );

        //freshy.unload( '../../lib/config' );

        configUtils.removeConfig( done );
    });

    after( function( done ) {

        freshy.unload( '../../lib/config' );

        configUtils.removeConfig( done );
    });

    beforeEach( function( done )  {

        freshy.unload( '../../lib/jwt' );
        freshy.unload( '../../lib/config' );

        require( '../../lib/config' ).wait( function( err ) {

            if( err ) {

                return done( err );
            }

            jwt = require( JWT_MODULE_PATH );
            state = require( STATE_MODULE_PATH );

            done();
        });
    });

    function reloadJWT() {

        jwt = freshy.reload( JWT_MODULE_PATH );
        state = require( STATE_MODULE_PATH );
    }

    describe( '.configure', function() {

        it( 'default secret passphrase', function() {

            jwt.configure( { secret: 'my-secret' } );

            expect( state.current.jwt ).to.eql( { enabled: true, algorithm: undefined, key: undefined, tokenName: 'jwt' } );
        });

        ALGORITHMS.forEach( function( algorithm ) {

            it( 'specified algorithm "' + algorithm + '" and secret passphrase', function() {

                if( algorithm === 'RS256' ) {

                    jwt.configure( { algorithm, public_key: 'my-secret' } );
                }
                else {

                    jwt.configure( { algorithm, secret: 'my-secret' } );
                }

                expect( state.current.jwt ).to.eql( { enabled: true, algorithm, key: 'my-secret', tokenName: 'jwt' } );
            });
        });

        it( "don't care about missing options", function() {

            jwt.configure();

            expect( state.current.jwt ).to.eql( { enabled: true, algorithm: undefined, key: undefined, tokenName: 'jwt' } );
        });

        it( "change jwt token name", function() {

            jwt.configure( { token_name: 'JWT' } );

            expect( state.current.jwt ).to.eql( { enabled: true, algorithm: undefined, key: undefined, tokenName: 'JWT' } )
        });

        [
            [ 'HS256', 'my-secret' ],
            [ 'HS384', 'my-secret' ],
            [ 'HS512', 'my-secret' ]

        ].forEach( function( test ) {

            it( 'config via environment variables - algorithm: ' + test[0], function() {

                process.env.VANDIUM_JWT_ALGORITHM = test[0];

                process.env.VANDIUM_JWT_SECRET = test[1];

                reloadJWT();

                expect( state.current.jwt ).to.eql( { enabled: true, algorithm: test[0], key: test[1], tokenName: 'jwt' } );

                delete process.env.VANDIUM_JWT_SECRET;
                delete process.env.VANDIUM_JWT_ALGORITHM;
            });
        });

        it( 'config via environment variables - algorithm: RS256', function() {

            process.env.VANDIUM_JWT_ALGORITHM = 'RS256';

            process.env.VANDIUM_JWT_PUBKEY = 'public-key-here';

            reloadJWT();

            expect( state.current.jwt ).to.eql( { enabled: true, algorithm: 'RS256', key: 'public-key-here', tokenName: 'jwt' } );

            delete process.env.VANDIUM_JWT_SECRET;
            delete process.env.VANDIUM_JWT_ALGORITHM;
        });

        it( 'config via environment variables - token name', function() {

            process.env.VANDIUM_JWT_TOKEN_NAME = 'JWT';

            reloadJWT();

            expect( state.current.jwt ).to.eql( { enabled: true, algorithm: undefined, key: undefined, tokenName: 'JWT' } );

            delete process.env.VANDIUM_JWT_TOKEN_NAME;
        });

        it( 'stage vars only set', function() {

            reloadJWT();

            jwt.configure();

            expect( state.current.jwt ).to.eql( { enabled: true, algorithm: undefined, key: undefined, tokenName: 'jwt' } );
        });

        it( 'no options object', function() {

            reloadJWT();

            jwt.configure();

            expect( state.current.jwt ).to.eql( { enabled: true, algorithm: undefined, key: undefined, tokenName: 'jwt' } );
        });

        it( 'default without configure', function() {

            reloadJWT();

            expect( state.current.jwt ).to.eql( { enabled: false, algorithm: undefined, key: undefined, tokenName: 'jwt' } );
        });

        after( function( done ) {

            // kill env vars

            delete process.env.VANDIUM_JWT_SECRET;
            delete process.env.VANDIUM_JWT_TOKEN_NAME;
            delete process.env.VANDIUM_JWT_ALGORITHM;
            delete process.env.VANDIUM_JWT_PUBKEY;

            // restore config to empty
            writeConfigData( "{}", done );
        });
    });

    describe( '.isEnabled', function() {

        before( function() {

            delete process.env.VANDIUM_JWT_SECRET;
            delete process.env.VANDIUM_JWT_TOKEN_NAME;
            delete process.env.VANDIUM_JWT_ALGORITHM;
            delete process.env.VANDIUM_JWT_PUBKEY;
        });

        beforeEach( function() {

            freshy.unload( JWT_MODULE_PATH );
            freshy.unload( CONFIG_MODULE_PATH );
        });

        it( 'default', function() {

            jwt = require( JWT_MODULE_PATH );

            expect( jwt.isEnabled() ).to.be.false;
        });

        it( 'via .enabled()', function() {

            jwt = require( JWT_MODULE_PATH );

            jwt.enable();

            expect( jwt.isEnabled() ).to.be.true;
        });
    });

    describe( '.configuration', function() {

        beforeEach( function() {

            freshy.unload( '../../lib/jwt' );
            freshy.unload( '../../lib/config' );
        });

        after( function( done ) {

            freshy.unload( '../../lib/jwt' );
            freshy.unload( '../../lib/config' );

            // restore config to empty
            writeConfigData( "{}", done );
        });


        it( 'update all config values via config file', function( done ) {


            var configData = {

                jwt: {

                    algorithm: 'HS512',
                    secret: 'super-secret',
                    token_name: 'Bearer'
                }
            };

            writeConfigData( JSON.stringify( configData ), function( err ) {

                if( err ) {

                    return done( err );
                }

                require( '../../lib/config' );

                jwt = require( JWT_MODULE_PATH );

                state = require( STATE_MODULE_PATH );

                expect( state.current.jwt ).to.eql( { enabled: true, algorithm: 'HS512', key: 'super-secret', tokenName: 'Bearer' } );

                done();
            });
        });


        it( 'update all config values via config file with public key', function( done ) {


            var configData = {

                jwt: {

                    algorithm: 'RS256',
                    public_key: pubKey,
                    token_name: 'Bearer'
                }
            };

            writeConfigData( JSON.stringify( configData ), function( err ) {

                if( err ) {

                    return done( err );
                }

                require( '../../lib/config' );

                jwt = require( JWT_MODULE_PATH );

                state = require( STATE_MODULE_PATH );

                expect( state.current.jwt ).to.eql( { enabled: true, algorithm: 'RS256', key: pubKey, tokenName: 'Bearer' } );

                done();
            });
        });

        it( 'config file with no values set', function( done ) {

            var configData = {

                jwt: { }
            };

            writeConfigData( JSON.stringify( configData ), function( err ) {

                if( err ) {

                    return done( err );
                }

                require( '../../lib/config' );

                jwt = require( JWT_MODULE_PATH );

                state = require( STATE_MODULE_PATH );

                expect( state.current.jwt ).to.eql( { enabled: true, algorithm: undefined, key: undefined, tokenName: 'jwt' } );

                done();
            });
        });
    });

    describe( '.validate', function() {

        before( function() {

            freshy.unload( '../../lib/jwt' );

            jwt = require( '../../lib/jwt' );
        });

        function testValidate( claims, algorithm, secret, publicKey, event, tokenName ) {

            var token = jwtSimple.encode( claims, secret, algorithm );

            var configParams = { algorithm: algorithm };

            if( algorithm === 'RS256' ) {

                configParams.public_key = publicKey;
            }
            else {

                configParams.secret = secret;
            }

            if( event ) {

                jwt.configure();
            }
            else {

                jwt.configure( configParams );

                event = {};
            }

            if( !tokenName ) {

                tokenName = 'jwt';
            }

            event[ tokenName ] = token;

            jwt.validate( event );

            expect( event[ tokenName ] ).to.be.a( 'object' );
            expect( event[ tokenName ].token ).to.equal( token );
            expect( event[ tokenName ].claims ).to.eql( claims );
        }

        function testValidateFail( claims, algorithm, secret, publicKey, event ) {

            var token = jwtSimple.encode( claims, secret, algorithm );

            var configParams = { algorithm: algorithm };

            if( algorithm === 'RS256' ) {

                configParams.public_key = publicKey;
            }
            else {

                configParams.secret = secret;
            }

            if( event ) {

                jwt.configure();
            }
            else {

                jwt.configure( configParams );

                event = {};
            }

            event.jwt = token;

            jwt.validate( event );
        }

        var passTests = [

            { desc: 'config with basic claims', claims: { user: 'fred' } },
            { desc: 'config with iat', claims: { user: 'fred', iat: Date.now()/1000 } },
            { desc: 'config with exp', claims: { user: 'fred', exp: (Date.now()/1000) + 300 } }
        ];

        passTests.forEach( function( test ) {

            ALGORITHMS.forEach( function( algorithm ) {

                it( test.desc + ' for ' + algorithm, function() {

                    if( algorithm === 'RS256' ) {

                        testValidate( test.claims, algorithm, privKey, pubKey );
                    }
                    else {

                        testValidate( test.claims, algorithm, 'my-secret' );
                    }
                });
            });
        });

        ALGORITHMS.forEach( function( algorithm ) {

            it( 'stage variables (all values set) for ' + algorithm, function() {

                var event = {

                    VANDIUM_JWT_ALGORITHM: algorithm,
                    VANDIUM_JWT_TOKEN_NAME: 'my-token'
                };

                if( algorithm === 'RS256' ) {

                    event.VANDIUM_JWT_PUBKEY = pubKey;

                    testValidate( { user: 'fred' }, algorithm, privKey, pubKey, event, 'my-token' );
                }
                else {

                    event.VANDIUM_JWT_SECRET = 'my-secret';

                    testValidate( { user: 'fred' }, algorithm, 'my-secret', null, event, 'my-token' );
                }
            });

            it( 'fail: stage variables but missing ' + (algorithm === 'RS256' ? 'VANDIUM_JWT_PUBKEY' : 'VANDIUM_JWT_SECRET') + ' for ' + algorithm, function() {

                var errorMessage = 'authentication error: missing validation key';

                var event = {

                    VANDIUM_JWT_ALGORITHM: algorithm,
                };

                if( algorithm === 'RS256' ) {

                    expect( testValidateFail.bind( null, { user: 'fred' }, algorithm, privKey, pubKey, event ) ).to.throw( errorMessage );
                }
                else {

                    expect( testValidateFail.bind( null, { user: 'fred' }, algorithm, 'my-secret', null, event ) ).to.throw( errorMessage );
                }
            });
        });

        it( 'fail: when stage vars is set but no algorithm present', function() {

            var errorMessage = 'authentication error: missing algorithm';

            var event = {};

            expect( testValidateFail.bind( null, { user: 'fred' }, 'HS256', 'my-secret', null, event ) ).to.throw( errorMessage );
        })

        var failTests = [

            { desc: 'config with iat + 5min in future',  claims: { user: 'fred', iat: (Date.now()/1000) + 300 }, error: 'authentication error: token used before issue date' },
            { desc: 'config with expired token', claims: { user: 'fred', exp: (Date.now()/1000) - 1 }, error: 'authentication error: Token expired' }
        ];

        failTests.forEach( function( test ) {

            ALGORITHMS.forEach( function( algorithm ) {

                it( 'fail: ' + test.desc + ' for ' + algorithm, function() {

                    if( algorithm === 'RS256' ) {

                         expect( testValidateFail.bind( null, test.claims, algorithm, privKey, pubKey ) ).to.throw( test.error );
                    }
                    else {

                         expect( testValidateFail.bind( null, test.claims, algorithm, 'my-secret' ) ).to.throw( test.error );
                    }
                });
            });
        });

        it( 'fail when unknown algorithm is used via stage variables', function() {

            jwt.configure();

            expect( jwt.validate.bind( null, { VANDIUM_JWT_ALGORITHM: 'whatever', jwt: 'token-goes-here===' } ) ).to.throw( 'unsupported jwt algorithm: whatever' );
        });

        it( 'fail when token is missing', function() {

            jwt.enable();

            expect( jwt.validate.bind( null, {} ) ).to.throw( 'authentication error: missing jwt token' );
        });

        it( 'error handling on jwt-simple', function() {

            jwt.configure( { algorith: 'HS256', secret: 'my-secret' } );

            var event = {

                jwt: 'bad.token'
            };

            expect( jwt.validate.bind( null, event ) ).to.throw( 'authentication error:' );
        });
    });
});
