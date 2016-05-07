'use strict';

const expect = require( 'chai' ).expect;

const freshy = require( 'freshy' );

describe( 'lib/ignored-properties', function() {

    let ignoredProperties = require( '../../lib/ignored-properties' );

    beforeEach( function() {

        ignoredProperties = freshy.reload( '../../lib/ignored-properties' );
    });

    describe( '.add', function() {

        it( 'normal operation', function() {

            ignoredProperties.add( 'test1' );
            expect( ignoredProperties.list() ).to.eql( [ 'test1' ] );

            // same value - no change
            ignoredProperties.add( 'test1' );
            expect( ignoredProperties.list() ).to.eql( [ 'test1' ] );

            ignoredProperties.add( 'test2' );
            expect( ignoredProperties.list() ).to.eql( [ 'test1', 'test2' ] );
        });
    });

    describe( '.remove', function() {

        it( 'normal operation', function() {

            ignoredProperties.add( 'test1' );
            expect( ignoredProperties.list() ).to.eql( [ 'test1' ] );

            ignoredProperties.remove( 'test1' );
            expect( ignoredProperties.list() ).to.eql( [] );

            // again
            ignoredProperties.remove( 'test1' );
            expect( ignoredProperties.list() ).to.eql( [] );
        });
    });

    describe( '.update', function() {

        it( 'existing value', function() {

            ignoredProperties.add( 'test1' );
            expect( ignoredProperties.list() ).to.eql( [ 'test1' ] );

            ignoredProperties.update( 'test1', 'test1-updated' );
            expect( ignoredProperties.list() ).to.eql( [ 'test1-updated' ] );
        });

        it( 'not an existing value', function() {

            // initial case
            expect( ignoredProperties.list() ).to.eql( [] );

            ignoredProperties.update( 'test', 'test-updated' );
            expect( ignoredProperties.list() ).to.eql( [ 'test-updated' ] );
        });

        it( 'same value', function() {

            ignoredProperties.add( 'test1' );
            expect( ignoredProperties.list() ).to.eql( [ 'test1' ] );

            ignoredProperties.update( 'test1', 'test1' );
            expect( ignoredProperties.list() ).to.eql( [ 'test1' ] );

        });
    });

    describe( '.list', function() {

        it( 'normal operation', function() {

            // initial case
            expect( ignoredProperties.list() ).to.eql( [] );

            ignoredProperties.add( 'test1' );
            expect( ignoredProperties.list() ).to.eql( [ 'test1' ] );

            ignoredProperties.remove( 'test1' );
            expect( ignoredProperties.list() ).to.eql( [] );
        });
    });
});
