'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const utils = require( '../utils' );

const querystring = require( 'querystring' );

describe( 'lib/utils', function() {

    describe( '.parseJSON', function() {

        var json = {

            one: 1,
            two: 'two',
            three: 'iii'
        };

        it( 'with callback', function() {

            utils.parseJSON( JSON.stringify( json ), function( err, obj ) {

                expect( err ).to.not.exist;
                expect( obj ).to.eql( json );
            });
        });

        it( 'with callback and error condition', function() {

            utils.parseJSON( '==' + JSON.stringify( json ), function( err, obj ) {

                expect( err ).to.exist;
                expect( obj ).to.not.exist;
            });
        });

        it( 'without callback', function() {

            expect( utils.parseJSON( JSON.stringify( json ) ) ).to.eql( json );
        });

        it( 'without callback with exception', function() {

            expect( utils.parseJSON.bind( null, '===' + JSON.stringify( json ) ) ).to.throw();
        });
    });

    describe( '.parseQueryString', function() {

        var qs = {

            one: '1',
            two: 'two',
            three: 'iii'
        };

        it( 'with callback', function() {

            utils.parseQueryString( querystring.stringify( qs ), function( err, obj ) {

                expect( err ).to.not.exist;
                expect( obj ).to.eql( qs );
            });
        });

        it( 'with callback and error condition', function() {

            utils.parseQueryString( querystring.stringify( qs ).replace( /=/g, ''), function( err, obj ) {

                expect( err ).to.exist;
                expect( obj ).to.not.exist;
            });
        });

        it( 'without callback', function() {

            expect( utils.parseQueryString( querystring.stringify( qs ) ) ).to.eql( qs );
        });

        it( 'without callback with exception', function() {

            expect( utils.parseQueryString.bind( null, querystring.stringify( qs ).replace( /=/g, '' ) ) ).to.throw();
        });
    });
});
