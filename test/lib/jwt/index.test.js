'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const token = require( '../../../lib/jwt/token' );

const utils = require( '../../../lib/jwt/utils' );

const jwt = require( '../../../lib/jwt/index' );

describe( 'lib/jwt/index', function() {

    describe( '.resolveAlgorithm', function() {

        it( 'normal operation', function() {

            expect( jwt.resolveAlgorithm ).to.equal( utils.resolveAlgorithm );
        });
    });

    describe( '.decode', function() {

        it( 'normal operation', function() {

            expect( jwt.decode ).to.equal( jwt.decode );
        });
    });

    describe( '.validateXSRF', function() {

        it( 'normal operation', function() {

            expect( jwt.validateXSRF ).to.equal( jwt.validateXSRF );
        });
    });
});
