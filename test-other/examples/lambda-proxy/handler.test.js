'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const proxyquire = require( 'proxyquire' );

const HandlerInvoker = require( '../../../test/lib/handler_invoker' );

describe( 'examples/lambda-proxy/handler', function() {

    let handler;

    beforeEach( function() {

        let vandium = proxyquire( '../../../lib/index', {} );

        handler = proxyquire( '../../../examples/lambda-proxy/handler', {

            'vandium': vandium
        }).handler;
    });

    describe( '.handler', function() {

        it( 'normal operation', function() {

            return HandlerInvoker( handler )
                .event( {

                    body: {

                        firstName: 'John',
                        lastName: 'Doe',
                        age: 42
                    }
                })
                .expectResult( (result) => {

                    expect( result ).to.eql( {

                        statusCode: 200,
                        headers: {},
                        body: '{"firstName":"John","lastName":"Doe","age":42}'
                    });
                });
        });

        it( 'fail when body is invalid', function() {

            return HandlerInvoker( handler )
                .event( {

                    body: {

                        firstName: 'John',
                        // no lastName
                        age: 42
                    }
                })
                .expectResult( (result) => {

                    expect( result ).to.eql( {

                        statusCode: 422,
                        headers: {},
                        body: '{"type":"ValidationError","message":"validation error: child \\"lastName\\" fails because [\\"lastName\\" is required]"}'
                    });
                });
        });

        it( 'fail when body is missing', function() {

            return HandlerInvoker( handler )
                .event( { } )
                .expectResult( (result) => {

                    expect( result ).to.eql( {

                        statusCode: 422,
                        headers: {},
                        body: '{"type":"ValidationError","message":"validation error: child \\"firstName\\" fails because [\\"firstName\\" is required]"}'
                    });
                });
        });

    });
});
