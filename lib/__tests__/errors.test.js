'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const errors = require( '../errors' );

const AuthenticationFailureError = errors.AuthenticationFailureError;

const ValidationError = errors.ValidationError;

describe( 'lib/errors', function() {

    describe( 'AuthenticationFailureError', function() {

        it( 'without message', function() {

            try {

                throw new AuthenticationFailureError();
            }
            catch( err ) {

                expect( err.message ).to.equal( 'authentication error' );
                expect( err.stack ).to.exist;
            }
        });

        it( 'with message', function() {

            try {

                throw new AuthenticationFailureError( 'my-message');
            }
            catch( err ) {

                expect( err.message ).to.equal( 'authentication error: my-message' );
                expect( err.stack ).to.exist;
            }
        });
    });

    describe( 'ValidationError', function() {

        it( 'without cause', function() {

            try {

                throw new ValidationError();
            }
            catch( err ) {

                expect( err.message ).to.equal( 'validation error' );
                expect( err.stack ).to.exist;
                expect( err.cause ).to.not.exist;
            }
        });

        it( 'with cause', function() {

            var cause = new Error( 'something was bad' );

            try {

                throw new ValidationError( cause );
            }
            catch( err ) {

                expect( err.message ).to.equal( 'validation error: something was bad' );
                expect( err.stack ).to.exist;
                expect( err.cause ).to.exist;
                expect( err.cause ).to.equal( cause );
            }
        });

        it( 'with cause but no message', function() {

            var cause = new Error();

            try {

                throw new ValidationError( cause );
            }
            catch( err ) {

                expect( err.message ).to.equal( 'validation error' );
                expect( err.stack ).to.exist;
                expect( err.cause ).to.exist;
                expect( err.cause ).to.equal( cause );
            }
        })
    });
});
