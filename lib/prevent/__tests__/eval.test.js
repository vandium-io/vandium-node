'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const MODULE_PATH = 'lib/prevent/eval';

const evalModule = require( '../eval' );

describe( MODULE_PATH, function() {

    describe( '.name', function() {

        it( 'normal operation', function() {

            expect( evalModule.name ).to.equal( 'eval' );
        });
    });

    describe( '.block', function() {

        it( 'block eval', function() {

            evalModule.block( true );

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


        it( 'allow eval', function() {

            evalModule.block( false );

            // should work
            eval( '{ var x = 5 }' );
        });

        it( 'toggle between modes', function() {

            evalModule.block( false );

            // should work
            eval( '{ var x = 5 }' );

            evalModule.block( true );

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

            evalModule.block( false );

            // should work
            eval( '{ var x = 5 }' );
        });
    });
});
