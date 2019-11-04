'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const sinon = require( 'sinon' );

const HandlerInvoker = require( './handler_invoker' );

describe( 'test/lib/handler_invoker', function() {

    describe( 'HandlerInvoker', function() {

        describe( 'constructor', function() {

            it( 'normal operation', function() {

                let handler = function() {};

                let invoker = HandlerInvoker( handler );

                expect( invoker.constructor.name ).to.equal( 'HandlerInvoker' );
                expect( invoker._handler ).to.equal( handler );
                expect( invoker._event ).to.eql( {} );
                expect( invoker._context ).to.eql( {} );
            });
        });

        describe( '.event', function() {

            it( 'normal operation', function() {

                const event = { one: 1 };

                let handler = function() {};

                let invoker = HandlerInvoker( handler ).event( event );

                expect( invoker.constructor.name ).to.equal( 'HandlerInvoker' );
                expect( invoker._handler ).to.equal( handler );
                expect( invoker._event ).to.equal( event );
                expect( invoker._context ).to.eql( {} );
            });
        });

        describe( '.context', function() {

            it( 'normal operation', function() {

                const context = { one: 1 };

                let handler = function() {};
                let invoker = HandlerInvoker( handler ).context( context );

                expect( invoker.constructor.name ).to.equal( 'HandlerInvoker' );
                expect( invoker._handler ).to.equal( handler );
                expect( invoker._event ).to.eql( {} );
                expect( invoker._context ).to.equal( context );
            });
        });

        describe( '.execute', function() {

            it( 'normal operation, result', function() {

                const event = { one: 1 };
                const context = { two: 2 };

                let handler = sinon.stub().yieldsAsync( null, 'ok' );

                let invoker = HandlerInvoker( handler )
                                .event( event )
                                .context( context );

                let returnValue = invoker.execute( (err,result) => {

                    expect( err ).to.not.exist;
                    expect( result ).to.equal( 'ok' );

                    expect( handler.calledOnce ).to.be.true;
                    expect( handler.firstCall.args[0] ).to.equal( event );
                    expect( handler.firstCall.args[1] ).to.equal( context );
                });

                // should be a promise
                expect( returnValue ).to.exist;
                expect( returnValue.then ).to.exist;
                expect( returnValue.catch ).to.exist;

                // let test framework do the rest
                return returnValue;
            });

            it( 'normal operation, error', function() {

                const event = { one: 1 };
                const context = { two: 2 };
                const error = new Error( 'bang' );

                let handler = sinon.stub().yieldsAsync( error );

                let invoker = HandlerInvoker( handler )
                                .event( event )
                                .context( context );

                let returnValue = invoker.execute( (err,result) => {

                    expect( err ).to.equal( error );
                    expect( result ).to.not.exist;

                    expect( handler.calledOnce ).to.be.true;
                    expect( handler.firstCall.args[0] ).to.equal( event );
                    expect( handler.firstCall.args[1] ).to.equal( context );
                });

                // should be a promise
                expect( returnValue ).to.exist;
                expect( returnValue.then ).to.exist;
                expect( returnValue.catch ).to.exist;

                // let test framework do the rest
                return returnValue;
            });

            it( 'fail: exception inside handler', function() {

                const event = { one: 1 };
                const context = { two: 2 };

                let handler = sinon.stub().throws( new Error( 'bang' ) );

                return HandlerInvoker( handler )
                            .event( event )
                            .context( context )
                            .execute( () => {} )
                            .then(
                                () => {

                                    throw new Error( 'should not call verifier' );
                                },
                                ( err ) => {

                                    expect( err.message ).to.equal( 'bang' );
                                }
                            );
            });
        });
    });
});
