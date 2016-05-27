'use strict';

const expect = require( 'chai' ).expect;

const stages = require( '../../lib/stages' );

describe( 'lib/stages', function() {

    describe( 'values', function() {

        it( 'normal operation', function() {

            expect( stages ).to.eql( {

                START: 'start',
                JWT: 'jwt',
                INPUT: 'input',
                EXEC: 'exec',
                POST: 'post'
            });
        });
    });
});
