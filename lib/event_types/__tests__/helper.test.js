const { expect } = require( 'chai' );

const helper = require( '../helper' );

describe( 'lib/event_types/helper', function() {

    describe( '.extractOptions', function() {

        it( 'options present', function() {

            let args = [ { options: 'here' }, function() {} ];

            let options = helper.extractOptions( args );

            expect( options ).to.eql( { options: 'here' } );
        });

        it( 'options not set', function() {

            let args = [ function() {} ];

            let options = helper.extractOptions( args );

            expect( options ).to.eql( {} );
        });
    });

    describe( '.extractHandler', function() {

        it( 'options present', function() {

            let handler = function() { return 42; };

            let args = [ { options: 'here' }, handler ];

            expect( helper.extractHandler( args ) ).to.equal( handler );
        });

        it( 'options not set', function() {

            let handler = function() { return 42; };

            let args = [ handler ];

            expect( helper.extractHandler( args ) ).to.equal( handler );
        });
    });
});
