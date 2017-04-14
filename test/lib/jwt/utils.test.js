'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const utils = require( '../../../lib/jwt/utils' );

describe( 'lib/jwt/utils', function() {

    describe( '.resolveAlgorithm', function() {

        [ 'RS256', 'HS256', 'HS384', 'HS512' ].forEach( ( algorithm ) => {

            it( `algorithm is ${algorithm}`, function() {

                let alg = utils.resolveAlgorithm( algorithm );

                expect( alg ).to.equal( algorithm );
            });
        });

        it( 'fail when algorithm is unknown', function() {

            expect( utils.resolveAlgorithm.bind( null, 'whatever' ) ).to.throw( 'authentication error: jwt algorithm "whatever" is unsupported' );
        });

        it( 'fail when algorithm is missing', function() {

            expect( utils.resolveAlgorithm.bind( null ) ).to.throw( 'authentication error: missing algorithm' );
        });
    });
});
