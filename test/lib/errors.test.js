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

            expect( Object.getOwnPropertyNames( err ) ).to.contain( 'message' );
            expect( Object.getOwnPropertyNames( err ) ).to.contain( 'stack' );
        });


        it( 'error with name', function() {

            let err = new Error( 'test' );

            err.name = 'MyError'
            err.other = 'hello';

            expect(  Object.getOwnPropertyNames( err ) ).to.eql( [ 'stack', 'message', 'name', 'other' ] );

            errors.strip( err );

            expect(  Object.getOwnPropertyNames( err ) ).to.contain( 'name' );
            expect(  Object.getOwnPropertyNames( err ) ).to.contain( 'message' );
            expect(  Object.getOwnPropertyNames( err ) ).to.contain( 'stack' );
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

    describe( '.stringify', function() {

        it( 'basic error', function() {

            let str = errors.stringify( new Error( 'bang' ) );

            expect( str ).to.be.a( 'string' );

            let error = JSON.parse( str );

            expect( error.errorType ).to.equal( 'Error' );
            expect( error.errorMessage ).to.equal( 'bang' );
            expect( error.status ).to.equal( 500 );
            expect( error.stackTrace ).to.exist;
            expect( Array.isArray( error.stackTrace ) ).to.be.true;
            expect( error.stackTrace.length > 0 ).to.be.true;
        });

        it( 'basic error with status code', function() {

            let str = errors.stringify( new Error( '[500] bang' ) );

            expect( str ).to.be.a( 'string' );

            let error = JSON.parse( str );

            expect( error.errorType ).to.equal( 'Error' );
            expect( error.errorMessage ).to.equal( '[500] bang' );
            expect( error.status ).to.not.exist;
            expect( error.stackTrace ).to.exist;
            expect( Array.isArray( error.stackTrace ) ).to.be.true;
            expect( error.stackTrace.length > 0 ).to.be.true;
        });

        it( 'basic error, no message', function() {

            let str = errors.stringify( new Error() );

            expect( str ).to.be.a( 'string' );

            let error = JSON.parse( str );

            expect( error.errorType ).to.equal( 'Error' );
            expect( error.errorMessage ).to.equal( 'Error' );
            expect( error.status ).to.equal( 500 );
            expect( error.stackTrace ).to.exist;
            expect( Array.isArray( error.stackTrace ) ).to.be.true;
            expect( error.stackTrace.length > 0 ).to.be.true;
        });

        it( 'custom error', function() {

            class MyError extends Error {

                constructor( msg, code ) {

                    super( msg );
                    this.code = code;
                    this.name = 'MyError';
                    this.status = 404;
                }
            }

            let str = errors.stringify( new MyError( 'bang', 42 ) );

            expect( str ).to.be.a( 'string' );

            let error = JSON.parse( str );

            expect( error.errorType ).to.equal( 'MyError' );
            expect( error.errorMessage ).to.equal( 'bang' );
            expect( error.code ).to.equal( 42 );
            expect( error.status ).to.equal( 404 );
            expect( error.stackTrace ).to.exist;
            expect( Array.isArray( error.stackTrace ) ).to.be.true;
            expect( error.stackTrace.length > 0 ).to.be.true;
        });

        it( 'custom error with statusCode', function() {

            class MyError extends Error {

                constructor( msg, code ) {

                    super( msg );
                    this.code = code;
                    this.name = 'MyError';
                    this.statusCode = 404;
                }
            }

            let str = errors.stringify( new MyError( 'bang', 42 ) );

            expect( str ).to.be.a( 'string' );

            let error = JSON.parse( str );

            expect( error.errorType ).to.equal( 'MyError' );
            expect( error.errorMessage ).to.equal( 'bang' );
            expect( error.code ).to.equal( 42 );
            expect( error.status ).to.equal( 404 );
            expect( error.stackTrace ).to.exist;
            expect( Array.isArray( error.stackTrace ) ).to.be.true;
            expect( error.stackTrace.length > 0 ).to.be.true;
        });

        it( 'bad stack value', function() {

            let err = new Error( 'bang' );
            err.stack = null;

            let str = errors.stringify( err  );

            expect( str ).to.be.a( 'string' );

            let error = JSON.parse( str );

            expect( error.errorType ).to.equal( 'Error' );
            expect( error.errorMessage ).to.equal( 'bang' );
            expect( error.stackTrace ).to.exist;
            expect( Array.isArray( error.stackTrace ) ).to.be.true;
            expect( error.stackTrace.length === 0 ).to.be.true;
        });

        it( 'object value', function() {

            let str = errors.stringify( { message: 'bang' }  );

            expect( str ).to.be.a( 'string' );

            let error = JSON.parse( str );

            expect( error.errorType ).to.equal( 'Error' );
            expect( error.errorMessage ).to.equal( 'bang' );
            expect( error.stackTrace ).to.not.exist;
        });
    });
});
