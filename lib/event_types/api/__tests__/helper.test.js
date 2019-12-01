const { expect } = require( 'chai' );

const helper = require( '../helper' );

describe( 'lib/event_types/api/helper', function() {

    describe( './processHeaderValue', function() {

        const { processHeaderValue } = helper;

        it( 'single value', function() {

            let headers = {};

            processHeaderValue( headers, 'h1', 'v1' );

            expect( headers ).to.eql( { h1: 'v1' } );
        });

        it( 'name is not set', function() {

            let headers = {};

            processHeaderValue( headers, null, 'v1' );

            expect( headers ).to.eql( {} );
        });

        it( 'value is null', function() {

            let headers = {};

            processHeaderValue( headers, 'h1', null );

            expect( headers ).to.eql( {} );
        });

        it( 'single value, different names', function() {

            let headers = {};

            processHeaderValue( headers, 'h1', 'v1' );
            processHeaderValue( headers, 'h2', 'v2' );

            expect( headers ).to.eql( { h1: 'v1', h2: 'v2' } );
        });

        it( 'single value, same names', function() {

            let headers = {};

            processHeaderValue( headers, 'h1', 'v1A' );

            expect( headers ).to.eql( { h1: 'v1A' } );

            processHeaderValue( headers, 'h1', 'v1B' );

            expect( headers ).to.eql( { h1: ['v1A', 'v1B' ] } );

            processHeaderValue( headers, 'h1', 'v1C' );

            expect( headers ).to.eql( { h1: ['v1A', 'v1B', 'v1C' ] } );
        });

        it( 'array value, same names', function() {

            let headers = {};

            processHeaderValue( headers, 'h1', ['v1A', 'v1B' ] );

            expect( headers ).to.eql( { h1: ['v1A', 'v1B' ] } );

            processHeaderValue( headers, 'h1', ['v1C', 'v1D' ] );

            expect( headers ).to.eql( { h1: ['v1A', 'v1B', 'v1C', 'v1D' ] } );
        });
    });
});
