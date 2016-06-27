'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const errors = require( '../../lib/errors' );

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

    describe( '.strip', function() {

        it( 'normal operation', function() {

            let err = new Error( 'test' );

            err.other = 'hello';

            expect(  Object.getOwnPropertyNames( err ) ).to.eql( [ 'stack', 'message', 'other' ] );

            errors.strip( err );

            expect(  Object.getOwnPropertyNames( err ) ).to.eql( [ 'message', 'stack' ] );
        });


        it( 'error with name', function() {

            let err = new Error( 'test' );

            err.name = 'MyError'
            err.other = 'hello';

            expect(  Object.getOwnPropertyNames( err ) ).to.eql( [ 'stack', 'message', 'name', 'other' ] );

            errors.strip( err );

            expect(  Object.getOwnPropertyNames( err ) ).to.eql( [ 'name', 'message', 'stack' ] );
        });

        it( 'non error (string) case', function() {

            let str = 'hello';

            errors.strip( str );

            expect( str ).to.equal( 'hello' );

            let obj = { one: 1 };

            errors.strip( obj );

            expect( obj ).to.eql( { one: 1 } );
        });
    });
});
