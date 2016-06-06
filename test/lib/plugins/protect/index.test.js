'use strict';

/*jshint expr: true*/

const freshy = require( 'freshy' );

const expect = require( 'chai' ).expect;

const PROTECT_MODULE_PATH = '../../../../lib/plugins/protect';

const STATE_MODULE_PATH = '../../../../lib/state';

describe( 'lib/plugins/protect/index', function() {

    let protect = require( PROTECT_MODULE_PATH );

    let state = require( STATE_MODULE_PATH );

    afterEach( function() {

        protect.sql.report();
    });

    describe( '.validate', function() {

        after( function() {

            protect.sql.report();
        });

        it( 'no attack', function() {

            let event = {

                myField: "nothin' exciting"
            };

            protect.validate( { event } );

            expect( event.myField ).to.equal( "nothin' exciting" );
        });

        it( 'potential attack', function() {

            let event = {

                myField: "''--"
            };

            protect.sql.fail();

            expect( protect.validate.bind( null, { event } ) ).to.throw( 'Error: validation error: myField is invalid' );
        });
    });

    describe( '.disable()', function() {

        it( 'disable sql', function() {

            let event = {

                myField: "''--"
            };

            protect.sql.fail();

            protect.disable( 'sql' );

            protect.validate( { event } );

            // re-enable
            event = {

                myField: "''--"
            };

            protect.sql.fail();

            expect( protect.validate.bind( null, { event } ) ).to.throw( 'Error: validation error: myField is invalid' );

            expect( state.current.protect ).to.eql( { sql: { enabled: true, mode: 'fail' } } );
        });

        it( 'disable all', function() {

            let event = {

                myField: "''--"
            };

            protect.sql.fail();

            protect.disable();

            protect.validate( { event } );
        });
    });

    describe( 'configure via environment variables', function() {

        beforeEach( function() {

            freshy.unload( PROTECT_MODULE_PATH );
        });

        it( 'not set', function() {

            delete process.env.VANDIUM_PROTECT;

            protect = require( PROTECT_MODULE_PATH );

            expect( protect.sql.enabled ).to.be.true;
            expect( protect.sql.mode ).to.equal( 'report' );
        });

        // on/true/yes
        [ 'on', 'On', 'yes', 'Yes', 'true', 'True' ].forEach( function( value ) {

            it( value, function() {

                process.env.VANDIUM_PROTECT = value;

                protect = require( PROTECT_MODULE_PATH );

                expect( protect.sql.enabled ).to.be.true;
                expect( protect.sql.mode ).to.equal( 'fail' );
            });
        });

        // off/no/false
        [ 'off', 'Off', 'no', 'No', 'false', 'False' ].forEach( function( value ) {

            it( value, function() {

                process.env.VANDIUM_PROTECT = value;

                protect = require( PROTECT_MODULE_PATH );

                expect( protect.sql.enabled ).to.be.false;
            });
        });

        // off/no/false
        [ 'report', 'Report' ].forEach( function( value ) {

            it( value, function() {

                process.env.VANDIUM_PROTECT = value;

                protect = require( PROTECT_MODULE_PATH );

                expect( protect.sql.enabled ).to.be.true;
                expect( protect.sql.mode ).to.equal( 'report' );
            });
        });

        it( 'unknown value', function() {

            process.env.VANDIUM_PROTECT = 'special';

            protect = require( PROTECT_MODULE_PATH );

            expect( protect.sql.enabled ).to.be.true;
            expect( protect.sql.mode ).to.equal( 'report' );
        });
    });
});
