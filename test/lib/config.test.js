'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const fs = require( 'fs' );

const appRoot = require( 'app-root-path' );

const proxyquire = require( 'proxyquire' );

const envRestorer = require( 'env-restorer' );


describe( 'lib/config', function() {

    function createAndLoadConfig( cfgData ) {

        if( cfgData ) {

            fs.writeFileSync( appRoot + '/vandium.json', JSON.stringify( cfgData ) );
        }

        return proxyquire( '../../lib/config', {} );
    }

    function removeConfigFile() {

        try {

            try {

                fs.unlinkSync( appRoot + '/vandium.json' );
            }
            catch( err ) {

                // ignore
            }

        }
        catch( err ) {


        }
    }

    beforeEach( removeConfigFile );
    afterEach( function() {

        envRestorer.restore();

        removeConfigFile();
    });

    it( 'no config file', function() {

        let config = createAndLoadConfig();

        expect( config ).to.eql( {} );
    });

    it( 'minimal config file', function() {

        let config = createAndLoadConfig( {} );

        expect( config ).to.eql( {} );
    });

    it( 'config file jwt with pub key, no xsrf', function() {

        createAndLoadConfig( {

            jwt: {

                algorithm: 'RS256',
                publicKey: 'whatever',
                token: 'header.JWT'
            }
        });

        expect( process.env.VANDIUM_JWT_ALGORITHM ).to.equal( 'RS256' );
        expect( process.env.VANDIUM_JWT_TOKEN_PATH ).to.equal( 'header.JWT' );
        expect( process.env.VANDIUM_JWT_PUBKEY ).to.equal( 'whatever' );
        expect( process.env.VANDIUM_JWT_USE_XSRF ).to.not.exist;
    });

    it( 'config file jwt with secret, no xsrf', function() {

        createAndLoadConfig( {

            jwt: {

                algorithm: 'HS256',
                secret: 'whatever',
                token: 'header.JWT'
            }
        });

        expect( process.env.VANDIUM_JWT_ALGORITHM ).to.equal( 'HS256' );
        expect( process.env.VANDIUM_JWT_TOKEN_PATH ).to.equal( 'header.JWT' );
        expect( process.env.VANDIUM_JWT_SECRET ).to.equal( 'whatever' );
        expect( process.env.VANDIUM_JWT_USE_XSRF ).to.not.exist;

    });

    it( 'config file jwt with key and simple xsrf', function() {

        createAndLoadConfig( {

            jwt: {

                algorithm: 'HS256',
                key: 'whatever',
                token: 'header.JWT',
                xsrf: true
            }
        });

        expect( process.env.VANDIUM_JWT_ALGORITHM ).to.equal( 'HS256' );
        expect( process.env.VANDIUM_JWT_TOKEN_PATH ).to.equal( 'header.JWT' );
        expect( process.env.VANDIUM_JWT_KEY ).to.equal( 'whatever' );
        expect( process.env.VANDIUM_JWT_USE_XSRF ).to.equal( 'true' );
    });

    it( 'config file jwt with key and simple xsrf being disabled', function() {

        createAndLoadConfig( {

            jwt: {

                algorithm: 'HS256',
                key: 'whatever',
                token: 'header.JWT',
                xsrf: false
            }
        });

        expect( process.env.VANDIUM_JWT_ALGORITHM ).to.equal( 'HS256' );
        expect( process.env.VANDIUM_JWT_TOKEN_PATH ).to.equal( 'header.JWT' );
        expect( process.env.VANDIUM_JWT_KEY ).to.equal( 'whatever' );
        expect( process.env.VANDIUM_JWT_USE_XSRF ).to.equal( 'false' );
    });

    it( 'config file jwt with key and simple xsrf being disabled', function() {

        createAndLoadConfig( {

            jwt: {

                algorithm: 'HS256',
                key: 'whatever',
                token: 'header.JWT',
                xsrf: true,
                xsrfToken: 'headers.xsrf',
                xsrfClaimName: 'xsrf'
            }
        });

        expect( process.env.VANDIUM_JWT_ALGORITHM ).to.equal( 'HS256' );
        expect( process.env.VANDIUM_JWT_TOKEN_PATH ).to.equal( 'header.JWT' );
        expect( process.env.VANDIUM_JWT_KEY ).to.equal( 'whatever' );
        expect( process.env.VANDIUM_JWT_USE_XSRF ).to.equal( 'true' );
        expect( process.env.VANDIUM_JWT_XSRF_TOKEN_PATH ).to.equal( 'headers.xsrf' );
        expect( process.env.VANDIUM_JWT_XSRF_CLAIM_NAME ).to.equal( 'xsrf' );
    });

    it( 'prevent settings', function() {

        createAndLoadConfig( {

            prevent: {

                eval: false
            }
        });

        expect( process.env.VANDIUM_PREVENT_EVAL ).to.equal( 'false' );
    });

    it( 'detect values already set', function() {

        process.env.VANDIUM_PREVENT_EVAL = 'true';

        createAndLoadConfig( {

            prevent: {

                eval: false
            }
        });

        expect( process.env.VANDIUM_PREVENT_EVAL ).to.equal( 'true' );
    });

    it( 'fail: when bad config file', function() {

        process.env.VANDIUM_PREVENT_EVAL = 'true';

        let config = createAndLoadConfig( 'string value!' );

        expect( config ).to.eql( {} );
    });
});
