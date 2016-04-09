'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const protect = require( '../../../lib/protect' );

describe( 'lib/protect/index', function() {

    afterEach( function() {

        protect.sql.report();
    });

    describe( '.scan', function() {

        after( function() {

            protect.sql.report();
        });

        it( 'no attack', function() {

            let event = {

                myField: "nothin' exciting"
            };

            protect.scan( event );

            expect( event.myField ).to.equal( "nothin' exciting" );
        });

        it( 'potential attack', function() {

            let event = {

                myField: "''--"
            };

            protect.sql.fail();

            expect( protect.scan.bind( null, event ) ).to.throw( 'Error: validation error: myField is invalid' );
        });
    });

    describe( '.disable()', function() {

        it( 'disable sql', function() {

            let event = {

                myField: "''--"
            };

            protect.sql.fail();

            protect.disable( 'sql' );

            protect.scan( event );

            // re-enable
            event = {

                myField: "''--"
            };

            protect.sql.fail();

            expect( protect.scan.bind( null, event ) ).to.throw( 'Error: validation error: myField is invalid' );
        });

        it( 'disable all', function() {

            let event = {

                myField: "''--"
            };

            protect.sql.fail();

            protect.disable();

            protect.scan( event );
        });
    });
});
