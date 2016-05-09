'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const freshy = require( 'freshy' );

const EVAL_MODULE_PATH =  '../../../lib/prevent/eval';

const restorer = require( './restorer' );

describe( 'lib/prevent/index', function() {

    describe( 'eval', function() {

        before( function() {

            freshy.unload( EVAL_MODULE_PATH );
        });

        after( function() {

            freshy.unload( EVAL_MODULE_PATH );

            restorer.restore();
        });

        it( 'eval intercepted', function() {

            // should work
            eval( '{ var x = 5 }' );

            require( EVAL_MODULE_PATH );

            try {

                eval( '{ var x = 5 }' );

                throw new Error( 'eval not blocked' );
            }
            catch( err ) {

                expect( err.message ).to.equal( 'security violation: eval() blocked' );
                expect( err.input ).to.be.instanceof( Array );
                expect( err.input.length ).to.equal( 1 );
                expect( err.input[0] ).to.equal( '{ var x = 5 }' );
            }
        });
    });
});
