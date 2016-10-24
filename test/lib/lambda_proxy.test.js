'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const MODULE_PATH = 'lib/lambda_proxy';

const LambdaProxy = require( '../../' + MODULE_PATH );

describe( MODULE_PATH, function() {

    describe( 'LambdaProxy', function() {

        describe( 'constructor', function() {

            it( 'normal operation', function() {

                let instance = new LambdaProxy();

                expect( instance ).to.eql( { _headers: {} } );
            });
        });

        describe( '.header', function() {

            it( 'normal operation', function() {

                let instance = new LambdaProxy();

                expect( instance ).to.eql( { _headers: {} } );

                expect( instance.header( 'Content-Type', 'application/json' ) ).to.equal( instance );
                expect( instance ).to.eql( { _headers: { 'Content-Type': 'application/json' } } );

                expect( instance.header( 'Content-Type', 'application/xml' ) ).to.equal( instance );
                expect( instance ).to.eql( { _headers: { 'Content-Type': 'application/xml' } } );

                expect( instance.header( 'other', '123' ) ).to.equal( instance );
                expect( instance ).to.eql( { _headers: { 'Content-Type': 'application/xml', other: '123' } } );
            });
        });

        describe( '.onError', function() {

            it( 'error with status', function() {

                let instance = new LambdaProxy();

                instance.header( 'Content-Type', 'application/json' );

                let event = {};
                let context = {};

                let error = new Error( 'Not Found' );
                error.status = 404;

                let obj = instance.onError( event, context, error );

                expect( obj ).to.eql( {

                    statusCode: 404,
                    headers: { 'Content-Type': 'application/json' },
                    body: '{"type":"Error","message":"Not Found"}'
                });
            });

            it( 'error with statusCode', function() {

                let instance = new LambdaProxy();

                instance.header( 'Content-Type', 'application/json' );

                let event = {};
                let context = {};

                let error = new Error( 'Not Found' );
                error.statusCode = 404;

                let obj = instance.onError( event, context, error );

                expect( obj ).to.eql( {

                    statusCode: 404,
                    headers: { 'Content-Type': 'application/json' },
                    body: '{"type":"Error","message":"Not Found"}'
                });
            });

            it( 'error without status or statusCode', function() {

                let instance = new LambdaProxy();

                instance.header( 'Content-Type', 'application/json' );

                let event = {};
                let context = {};

                let error = new Error( 'Not Found' );

                let obj = instance.onError( event, context, error );

                expect( obj ).to.eql( {

                    statusCode: 500,
                    headers: { 'Content-Type': 'application/json' },
                    body: '{"type":"Error","message":"Not Found"}'
                });
            });
        });

        describe( '.onResult', function() {

            it( 'result is a proxy object', function() {

                let instance = new LambdaProxy();

                let event = {};
                let context = {};

                let result = {

                    statusCode: 200,
                    headers: {

                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify( { one: 1, two: 'II', three: 'Three' } )
                };

                let obj = instance.onResult( event, context, result );

                expect( obj ).to.eql( result );
                expect( obj ).to.not.equal( result );
            });

            it( 'result is an object, event.httpMethod=GET', function() {

                let instance = new LambdaProxy();

                instance.header( 'Content-Type', 'application/json' );

                let event = {

                    httpMethod: 'GET'
                };

                let context = {};

                let result = {

                    one: 1,

                    two: 'II',

                    three: 'Three'
                };

                let obj = instance.onResult( event, context, result );

                expect( obj ).to.eql( {

                    statusCode: 200,
                    headers: { 'Content-Type': 'application/json' },
                    body: '{"one":1,"two":"II","three":"Three"}'
                });
            });

            it( 'result is an object, event.httpMethod=POST', function() {

                let instance = new LambdaProxy();

                instance.header( 'Content-Type', 'application/json' );

                let event = {

                    httpMethod: 'POST'
                };

                let context = {};

                let result = {

                    one: 1,

                    two: 'II',

                    three: 'Three'
                };

                let obj = instance.onResult( event, context, result );

                expect( obj ).to.eql( {

                    statusCode: 201,
                    headers: { 'Content-Type': 'application/json' },
                    body: '{"one":1,"two":"II","three":"Three"}'
                });
            });

            it( 'result is an object, event.httpMethod=DELETE', function() {

                let instance = new LambdaProxy();

                instance.header( 'Content-Type', 'application/json' );

                let event = {

                    httpMethod: 'DELETE'
                };

                let context = {};

                let result = {

                    one: 1,

                    two: 'II',

                    three: 'Three'
                };

                let obj = instance.onResult( event, context, result );

                expect( obj ).to.eql( {

                    statusCode: 204,
                    headers: { 'Content-Type': 'application/json' },
                    body: '{"one":1,"two":"II","three":"Three"}'
                });
            });

            it( 'result does not exist, event.httpMethod=GET', function() {

                let instance = new LambdaProxy();

                instance.header( 'Content-Type', 'application/json' );

                let event = {

                    httpMethod: 'DELETE'
                };

                let context = {};

                let obj = instance.onResult( event, context );

                expect( obj ).to.eql( {

                    statusCode: 204,
                    headers: { 'Content-Type': 'application/json' },
                    body: '{}'
                });
            });
        });
    });
});
