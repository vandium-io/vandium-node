'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const jwtBuilder = require( 'jwt-builder' );

const configUtils = require( './config-utils' );

const VANDIUM_MODULE_PATH = '../../lib/index';

const vandium = require( VANDIUM_MODULE_PATH );

const envRestorer = require( 'env-restorer' );

//require( '../lib/logger' ).setLevel( 'debug' );

describe( 'index', function() {

    beforeEach( function() {

        configUtils.removeConfig();

        envRestorer.restore();
    });

    after( function() {

        // NEED to disable eval prevention
        process.env.VANDIUM_PREVENT_EVAL = "false"
        require( '../../lib/prevent' ).configure();

        envRestorer.restore();
    });

    describe( '.api', function() {

        it( 'normal operation', function() {

            expect( vandium.api ).to.existl;
        });
    });

    describe( '.s3', function() {

        it( 'normal operation', function() {

            expect( vandium.s3 ).to.existl;
        });
    });

    describe( '.dyanmodb', function() {

        it( 'normal operation', function() {

            expect( vandium.dyanmodb ).to.existl;
        });
    });

    describe( '.sns', function() {

        it( 'normal operation', function() {

            expect( vandium.sns ).to.existl;
        });
    });

    describe( '.ses', function() {

        it( 'normal operation', function() {

            expect( vandium.ses ).to.existl;
        });
    });

    describe( '.kinesis', function() {

        it( 'normal operation', function() {

            expect( vandium.kinesis ).to.existl;
        });
    });
});
