'use strict';

var expect = require( 'chai' ).expect;

var fs = require( 'fs' );

var freshy = require( 'freshy' );

var NodeRSA = require('node-rsa');

var jwtSimple = require('jwt-simple');

var jwt = require( '../../lib/jwt' );

var ALGORITHMS = [ 'HS256', 'HS384', 'HS512', 'RS256' ];

var logger = require( '../../lib/logger' ).setDefaultLevel( 'warn' );

var appRoot = require( 'app-root-path' );

var configUtils = require( './config-utils' );

describe( 'lib/jwt', function() {

    function writeConfigData( configData, callback ) {

        configUtils.writeConfig( configData, callback );
    }

    var originalConfigData;

    before( function( done ) {

        configUtils.readConfig( function( err, content ) {

            originalConfigData = content;

            writeConfigData( "{}", done );
        });
    });

    after( function( done ) {

        if( originalConfigData ) {

            writeConfigData( originalConfigData, done );
        }
    });

    beforeEach( function( done )  {

        freshy.unload( '../../lib/jwt' );
        freshy.unload( '../../lib/config' );

        require( '../../lib/config' ).wait( function( err ) {

            if( err ) {

                return done( err );
            }

            jwt = require( '../../lib/jwt' );

            done();
        });
    });

    describe( '.configure', function() {

        var jwtSimple;

        var jwtResult;

        it( 'default secret passphrase', function() {

            var settings = jwt.configure( { secret: 'my-secret' } );

            expect( settings ).to.eql( { algorithm: 'HS256', key: 'my-secret', stageVars: false, tokenName: 'jwt' } );
        });

        ALGORITHMS.forEach( function( algorithm ) {

            it( 'specified algorithm "' + algorithm + '" and secret passphrase', function() {

                if( algorithm === 'RS256' ) {

                    var settings = jwt.configure( { algorithm: 'RS256', public_key: 'my-secret' } );

                    expect( settings ).to.eql( { algorithm: 'RS256', key: 'my-secret', stageVars: false, tokenName: 'jwt' } );  
                }
                else {

                    var settings = jwt.configure( { algorithm: algorithm, secret: 'my-secret' } );

                    expect( settings ).to.eql( { algorithm: algorithm, key: 'my-secret', stageVars: false, tokenName: 'jwt' } );                    
                }
            });
        });

        it( 'fail when algorithm is invalid', function() {

            expect( jwt.configure.bind( null, { algorithm: 'RSASuper' } ) ).to.throw( 'unsupported algorithm type: RSASuper' );
        })

        it( 'fail when secret is missing when passphrase algorithm is used', function() {

            expect( jwt.configure.bind( null, { algorithm: 'HS384' } ) ).to.throw( 'missing "secret" option' );
        })

        it( 'fail when public_key is missing', function() {

            expect( jwt.configure.bind( null, { algorithm: 'RS256' } ) ).to.throw( 'missing "public_key" option' );
        });

        it( "don't care about missing options when useStageVars is set", function() {

            expect( jwt.configure( { useStageVars: true } ) ).to.eql( { algorithm: undefined, key: undefined, stageVars: true, tokenName: 'jwt' } );
        });

        it( "change jwt token name", function() {

            expect( jwt.configure( { useStageVars: true, token_name: 'JWT' } ) ).to.eql( { algorithm: undefined, key: undefined, stageVars: true, tokenName: 'JWT' } );
        });

        it( 'config via environment variables', function() {

            process.env.VANDIUM_JWT_ALGORITHM = 'HS256';

            process.env.VANDIUM_JWT_SECRET = 'my-secret';

            process.env.VANDIUM_JWT_TOKEN_NAME = 'JWT';

            expect( jwt.configure( { useStageVars: true } ) ).to.eql( { algorithm: 'HS256', key: 'my-secret', stageVars: true, tokenName: 'JWT' } );

            process.env.VANDIUM_JWT_ALGORITHM = 'RS256';

            process.env.VANDIUM_JWT_PUBKEY = 'xxxxxxx';

            process.env.VANDIUM_JWT_TOKEN_NAME = 'JWT';

            expect( jwt.configure( { useStageVars: true } ) ).to.eql( { algorithm: 'RS256', key: 'xxxxxxx', stageVars: true, tokenName: 'JWT' } );

            delete process.env.VANDIUM_JWT_SECRET;
            delete process.env.VANDIUM_JWT_TOKEN_NAME;
            delete process.env.VANDIUM_JWT_ALGORITHM;
            delete process.env.VANDIUM_JWT_PUBKEY;
        });

        it( 'stage vars only set', function() {

            freshy.unload( '../../lib/jwt' );
            jwt = require( '../../lib/jwt' );

            expect( jwt.configure( { useStageVars: true } ) ).to.eql( { algorithm: undefined, key: undefined, stageVars: true, tokenName: 'jwt' } );
        });

        it( 'no options object', function() {

            freshy.unload( '../../lib/jwt' );
            jwt = require( '../../lib/jwt' );

            expect( jwt.configure() ).to.eql( { algorithm: undefined, key: undefined, stageVars: true, tokenName: 'jwt' } );
        });

        it( 'default without configure', function() {

            freshy.unload( '../../lib/jwt' );
            jwt = require( '../../lib/jwt' );

            expect( jwt.configuration() ).to.eql( { algorithm: undefined, key: undefined, stageVars: true, tokenName: 'jwt' } );
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
                    key: 'super-secret',
                    token_name: 'Bearer'
                }
            };

            writeConfigData( JSON.stringify( configData ), function( err ) {

                if( err ) {

                    return done( err );
                }

                require( '../../lib/config' ).wait( function() {

                    jwt = require( '../../lib/jwt' );

                    expect( jwt.configuration() ).to.eql( { algorithm: 'HS512', key: 'super-secret', stageVars: false, tokenName: 'Bearer' } );

                    done();
                }); 
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

                require( '../../lib/config' ).wait( function() {

                    jwt = require( '../../lib/jwt' );

                    expect( jwt.configuration() ).to.eql( { algorithm: undefined, key: undefined, stageVars: false, tokenName: 'jwt' } );

                    done();
                }); 
            });
        });
    });
    
    describe( '.validate', function() {

        var pubKey;
        var privKey;

        before( function() {

            freshy.unload( '../../lib/jwt' );

            jwt = require( '../../lib/jwt' );

            var RSAKey = new NodeRSA({b: 512});

            var keyPair = RSAKey.generateKeyPair( 512 );

            privKey = keyPair.exportKey( 'private' );
            pubKey = keyPair.exportKey( 'public' );
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
            { desc: 'config with expired token', claims: { user: 'fred', exp: (Date.now()/1000) - 1 }, error: 'authentication error: token expired' }
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

        it( 'fail when unknown alogorithm is used via stage variables', function() {

            jwt.configure();

            expect( jwt.validate.bind( null, { VANDIUM_JWT_ALGORITHM: 'whatever', jwt: 'token-goes-here===' } ) ).to.throw( 'unsupported jwt algorithm: whatever' );
        });

        it( 'fail when token is missing', function() {

            expect( jwt.validate.bind( null, {} ) ).to.throw( 'authentication error: missing jwt token' );
        });
    });
});