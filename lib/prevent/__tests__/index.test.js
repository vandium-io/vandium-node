'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const MODULE_PATH = 'lib/prevent/index';

const prevent = require( '../index' );

describe( 'lib/prevent/index', function() {

    describe( 'PreventManager (singleton)', function() {

        beforeEach( function() {

            delete process.env.VANDIUM_PREVENT_EVAL;
        });

        after( function() {

            delete process.env.VANDIUM_PREVENT_EVAL;
        });

        describe( '.configure', function() {

            it( 'default state', function() {

                prevent.configure();

                expect( eval.bind( null, 'var x = 5;' ) ).to.throw( 'security violation:' );
            });

            it( 'VANDIUM_PREVENT_EVAL = "true"', function() {

                process.env.VANDIUM_PREVENT_EVAL = 'true';

                prevent.configure();

                expect( eval.bind( null, 'var x = 5;' ) ).to.throw( 'security violation:' );
            });

            it( 'VANDIUM_PREVENT_EVAL = "TRUE"', function() {

                process.env.VANDIUM_PREVENT_EVAL = 'TRUE';

                prevent.configure();

                expect( eval.bind( null, 'var x = 5;' ) ).to.throw( 'security violation:' );
            });

            it( 'VANDIUM_PREVENT_EVAL = "false"', function() {

                process.env.VANDIUM_PREVENT_EVAL = 'false';

                prevent.configure();

                expect( eval.bind( null, 'var x = 5;' ) ).to.not.throw( 'security violation:' );
            });

            it( 'VANDIUM_PREVENT_EVAL = "FALSE"', function() {

                process.env.VANDIUM_PREVENT_EVAL = 'FALSE';

                prevent.configure();

                expect( eval.bind( null, 'var x = 5;' ) ).to.not.throw( 'security violation:' );
            });
        });

        describe( '.state', function() {

            it( 'default', function() {

                prevent.configure();

                expect( prevent.state ).to.eql( { 'eval': true } );
            });

            it( 'VANDIUM_PREVENT_EVAL = "true"', function() {

                process.env.VANDIUM_PREVENT_EVAL = 'true';

                prevent.configure();

                expect( prevent.state ).to.eql( { 'eval': true } );
            });

            it( 'VANDIUM_PREVENT_EVAL = "TRUE"', function() {

                process.env.VANDIUM_PREVENT_EVAL = 'TRUE';

                prevent.configure();

                expect( prevent.state ).to.eql( { 'eval': true } );
            });

            it( 'VANDIUM_PREVENT_EVAL = "false"', function() {

                process.env.VANDIUM_PREVENT_EVAL = 'false';

                prevent.configure();

                expect( prevent.state ).to.eql( { 'eval': false } );
            });

            it( 'VANDIUM_PREVENT_EVAL = "FALSE"', function() {

                process.env.VANDIUM_PREVENT_EVAL = 'FALSE';

                prevent.configure();

                expect( prevent.state ).to.eql( { 'eval': false } );
            });
        });
    });
});
