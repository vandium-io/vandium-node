'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const freshy = require( 'freshy' );

const PREVENT_MODULE_PATH =  '../../../lib/prevent/index';

const restorer = require( './restorer' );

describe( 'lib/prevent/index', function() {

    beforeEach( function() {

        delete process.env.VANDIUM_PREVENT_EVAL;

        freshy.unload( PREVENT_MODULE_PATH );
    });

    afterEach( function() {

        freshy.unload( PREVENT_MODULE_PATH );

        restorer.restore();
    });

    describe( 'load', function() {

        it( 'EVAL not set', function() {

            let prevent = require( PREVENT_MODULE_PATH );

            expect( eval.bind( null, 'var x = 5;' ) ).to.throw( 'security violation:' );
        });

        it( 'EVAL set', function() {

            process.env.VANDIUM_PREVENT_EVAL = false;

            let prevent = require( PREVENT_MODULE_PATH );

            expect( eval.bind( null, 'var x = 5;' ) ).to.not.throw( 'security violation:' );
        });
    });
});
