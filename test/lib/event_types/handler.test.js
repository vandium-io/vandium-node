'use strict';

/*jshint expr: true*/

const { should, expect } = require( 'chai' );

const sinon = require( 'sinon' );

const Handler = require( '../../../lib/event_types/handler' );

describe( 'lib/event_types/handler', function() {

    describe( 'constructor', function() {

        it( 'normal operation', function() {

            let instance = new Handler();

            expect( instance.afterFunc ).to.exist;
            expect( instance.eventProc ).to.exist;
        });
    });

    describe( '.addMethodsToHandler', function() {

        it( 'normal operation', function() {

            let lambda = function() {};
            expect( lambda.finally ).to.not.exist;

            let instance = new Handler();

            instance.addMethodsToHandler( lambda );
            expect( lambda.finally ).to.exist;
            expect( lambda.finally ).to.be.a( 'function' );

            let finallyFunc = function() {};

            let returnValue = lambda.finally( finallyFunc );
            expect( returnValue ).to.equal( lambda );

            expect( instance.afterFunc ).to.equal( finallyFunc );
        });
    });

    describe( '.handler', function() {

        it( 'normal operation', function() {

            let instance = new Handler();

            expect( instance.executor ).to.not.exist;

            let handler = sinon.stub().returns( 42 );

            let returnValue = instance.handler( handler );
            expect( returnValue ).to.equal( instance );

            expect( handler.called ).to.be.false;

            expect( instance.executor ).to.exist;
            expect( instance.executor ).to.not.equal( handler );

            let executorReturnValue = instance.executor( {}, {} );
            expect( executorReturnValue ).to.be.instanceof( Promise );

            return executorReturnValue
                .then( (value) => {

                    expect( value ).to.equal( 42 );
                    expect( handler.calledOnce ).to.be.true;
                });
        });
    });

    describe( '.processResult', function() {

        it( 'normal operation', function() {

            let instance = new Handler();

            let processed = instance.processResult( { value: 42 }, {} );

            expect( processed ).to.eql( { result: { value: 42 } } );
        });
    });

    describe( '.processError', function() {

        it( 'normal operation', function() {

            let instance = new Handler();

            let error = new Error( 'bang' );

            return instance.processError( error, {} )
                .then( processed => {

                    expect( processed ).to.eql( { error } );
                });
        });

        it( 'normal operation (async)', function() {

            let instance = new Handler();

            instance.processError = async ( error, {} ) => {

                return new Promise( (resolve) => {

                    setTimeout( () => {

                        resolve( { error, code: '500' } );
                    }, 20);
                });
            };

            let error = new Error( 'bang' );

            return instance.processError( error, {} )
                .then( processed => {

                    expect( processed ).to.eql( { error, code: '500' } );
                });
        });

        it( 'exception throw while executing (async)', function() {

            let instance = new Handler();

            instance.processError = async ( error, {} ) => {

                return new Promise( (resolve, reject) => {

                    setTimeout( () => {

                        reject( new Error( 'boom') );
                    }, 20);
                });
            };

            let error = new Error( 'bang' );

            return instance.processError( error, {} )
                .then( processed => {

                    expect( processed ).to.be.undefined;
                })
                .catch( err => {

                    expect( err.message ).to.equal( 'boom' );
                });
        });
    });

    describe( '.before', function() {

        it( 'normal operation', function() {

            let beforeFunc =  function() {};

            let instance = new Handler();
            expect( instance.beforeFunc ).to.exist;
            expect( instance.beforeFunc ).to.not.equal( beforeFunc );

            let returnValue = instance.before( beforeFunc );
            expect( returnValue ).to.equal( instance );
            expect( instance.beforeFunc ).to.equal( beforeFunc );
        });
    });

    describe( '.callbackWaitsForEmptyEventLoop', function() {

      it( 'default operation', function() {

          let instance = new Handler();
          expect( instance._configuration.callbackWaitsForEmptyEventLoop ).to.not.exist;

          let returnValue = instance.callbackWaitsForEmptyEventLoop();
          expect( instance._configuration.callbackWaitsForEmptyEventLoop ).to.equal( true );
          expect( returnValue ).to.equal( instance );
      });

        it( 'set to false', function() {

            let instance = new Handler();
            expect( instance._configuration.callbackWaitsForEmptyEventLoop ).to.not.exist;

            let returnValue = instance.callbackWaitsForEmptyEventLoop( false );
            expect( instance._configuration.callbackWaitsForEmptyEventLoop ).to.equal( false );
            expect( returnValue ).to.equal( instance );
        });
    });

    describe( '.finally', function() {

        it( 'normal operation', function() {

            let finallyFunc = function() {};

            let instance = new Handler();
            expect( instance.afterFunc ).to.exist;
            expect( instance.afterFunc ).to.not.equal( finallyFunc );

            let returnValue = instance.finally( finallyFunc );
            expect( returnValue ).to.equal( instance );
            expect( instance.afterFunc ).to.equal( finallyFunc );
        });
    });

    describe( '.eventProcessor', function() {

        it( 'normal operation', function() {

            let eventProc = function() {};

            let instance = new Handler();
            expect( instance.eventProc ).to.exist;
            expect( instance.eventProc ).to.not.equal( eventProc );

            let returnValue = instance.eventProcessor( eventProc );
            expect( returnValue ).to.equal( instance );
            expect( instance.eventProc ).to.equal( eventProc );
        });
    });

    describe( '.execute', function() {

        it( 'handler with result, no finally', async function() {

            let instance = new Handler();

            let lambda = instance.handler( function( event, context  ) {

                    expect( context.getRemainingTimeInMillis ).to.exist;
                    expect( context.getRemainingTimeInMillis() ).to.equal( 1000 );

                    return 42;
                } ).createLambda();

            let event = {};
            let context = {

                getRemainingTimeInMillis() { return 1000; }
            };

            const result = await lambda( event, context );

            expect( result ).to.equal( 42 );
        });

        it( 'handler with result with finally', async function() {

            let instance = new Handler();

            let after = sinon.stub().returns( 4 );

            let lambda = instance.handler( function( event, context  ) {

                    expect( context.getRemainingTimeInMillis ).to.exist;
                    expect( context.getRemainingTimeInMillis() ).to.equal( 1000 );

                    return 42;
                } )
                .finally( after )
                .createLambda();

            let event = {};
            let context = {

                getRemainingTimeInMillis() { return 1000; }
            };

            let result = await lambda( event, context );

            expect( result ).to.equal( 42 );
            expect( after.calledOnce ).to.be.true;
        });

        it( 'handler with result with finally that throws uncaught exception', async function() {

            let instance = new Handler();

            let after = sinon.stub().throws( new Error( 'bang' ) );

            let lambda = instance.handler( function( event, context  ) {

                    expect( context.getRemainingTimeInMillis ).to.exist;
                    expect( context.getRemainingTimeInMillis() ).to.equal( 1000 );

                    return 42;
                } )
                .finally( after )
                .createLambda();

            let event = {};
            let context = {

                getRemainingTimeInMillis() { return 1000; }
            };

            const result = await lambda( event, context );

            expect( result ).to.equal( 42 );
            expect( after.calledOnce ).to.be.true;
        });

        it( 'handler with result with async finally', async function() {

            let instance = new Handler();

            let afterStub = sinon.stub().yieldsAsync( null, 4 );
            let after = function( context, callback ) { afterStub( callback ); };

            let lambda = instance.handler( function( event, context  ) {

                    expect( context.getRemainingTimeInMillis ).to.exist;
                    expect( context.getRemainingTimeInMillis() ).to.equal( 1000 );

                    return 42;
                } )
                .finally( after )
                .createLambda();

            let event = {};
            let context = {

                getRemainingTimeInMillis() { return 1000; }
            };

            const result = await lambda( event, context );

            expect( result ).to.equal( 42 );

            expect( afterStub.calledOnce ).to.be.true;
        });

        it( 'handler with result with finally', async function() {

            let instance = new Handler();

            let after = sinon.stub().returns( 4 );

            let lambda = instance.handler( function( event, context  ) {

                    expect( context.getRemainingTimeInMillis ).to.exist;
                    expect( context.getRemainingTimeInMillis() ).to.equal( 1000 );

                    return 42;
                } )
                .finally( after )
                .createLambda();

            let event = {};
            let context = {

                getRemainingTimeInMillis() { return 1000; }
            };

            const result = await lambda( event, context );

            expect( result ).to.equal( 42 );
            expect( after.calledOnce ).to.be.true;
        });

        it( 'handler with result with finally that throws uncaught exception', async function() {

            let instance = new Handler();

            let after = sinon.stub().throws( new Error( 'bang' ) );

            let lambda = instance.handler( function( event, context  ) {

                    expect( context.getRemainingTimeInMillis ).to.exist;
                    expect( context.getRemainingTimeInMillis() ).to.equal( 1000 );

                    return 42;
                } )
                .finally( after )
                .createLambda();

            let event = {};
            let context = {

                getRemainingTimeInMillis() { return 1000; }
            };

            const result = await lambda( event, context );

            expect( result ).to.equal( 42 );
            expect( after.calledOnce ).to.be.true;
        });

        it( 'handler with result and before (sync)', async function() {

            let instance = new Handler();

            let userValue = { one: 1 };

            let beforeStub = sinon.stub().returns( userValue );

            let lambda = instance.before( beforeStub )
                    .handler( function( event, context  ) {

                        expect( context.getRemainingTimeInMillis ).to.exist;
                        expect( context.getRemainingTimeInMillis() ).to.equal( 1000 );

                        expect( context.additional ).to.equal( userValue );

                        return 42;
                    })
                    .createLambda();

            let event = {};
            let context = {

                getRemainingTimeInMillis() { return 1000; }
            };

            const result = await lambda( event, context );

            expect( result ).to.equal( 42 );

            expect( beforeStub.calledOnce ).to.be.true;
        });

        it( 'handler with result and before (promise)', async function() {

            let instance = new Handler();

            let userValue = { one: 1 };

            let beforeStub = sinon.stub().returns( Promise.resolve( userValue ) );

            let lambda = instance.before( beforeStub )
                    .handler( function( event, context  ) {

                        expect( context.getRemainingTimeInMillis ).to.exist;
                        expect( context.getRemainingTimeInMillis() ).to.equal( 1000 );

                        expect( context.additional ).to.equal( userValue );

                        return 42;
                    })
                    .createLambda();

            let event = {};
            let context = {

                getRemainingTimeInMillis() { return 1000; }
            };

            const result = await lambda( event, context );

            expect( result ).to.equal( 42 );
            expect( beforeStub.calledOnce ).to.be.true;
        });

        it( 'handler with result and before (async)', async function() {

            let instance = new Handler();

            let userValue = { one: 1 };

            let beforeStub = sinon.stub().yieldsAsync( null, userValue );

            let lambda = instance.before( ( context, callback ) => {

                        beforeStub( callback );
                    })
                    .handler( function( event, context  ) {

                        expect( context.getRemainingTimeInMillis ).to.exist;
                        expect( context.getRemainingTimeInMillis() ).to.equal( 1000 );

                        expect( context.additional ).to.equal( userValue );

                        return 42;
                    })
                    .createLambda();

            let event = {};
            let context = {

                getRemainingTimeInMillis() { return 1000; }
            };

            const result = await lambda( event, context );

            expect( result ).to.equal( 42 );

            expect( beforeStub.calledOnce ).to.be.true;
        });

        it( 'handler with result and before has exception', async function() {

            let instance = new Handler();

            let userValue = { one: 1 };

            let beforeStub = sinon.stub().yieldsAsync( new Error( 'bang' ) );

            let handlerStub = sinon.stub().returns( 42 );

            let lambda = instance.before( ( context, callback ) => {

                        beforeStub( callback );
                    })
                    .handler( handlerStub )
                    .createLambda();

            let event = {};
            let context = {

                getRemainingTimeInMillis() { return 1000; }
            };

            try {

                await lambda( event, context );

                should.fail( 'result shoudl not be returned' );
            }
            catch( err ) {

                expect( err.message ).to.equal( 'bang' );

                expect( beforeStub.calledOnce ).to.be.true;
                expect( handlerStub.called ).to.be.false;
            }
        });

        it( 'handler with context.callbackWaitsForEmptyEventLoop = true', async function() {

            let instance = new Handler();

            let lambda = instance.handler( function( event, context  ) {

                    expect( context.getRemainingTimeInMillis ).to.exist;
                    expect( context.getRemainingTimeInMillis() ).to.equal( 1000 );
                    context.callbackWaitsForEmptyEventLoop = true;

                    return 42;
                } ).createLambda();

            let event = {};
            let context = {

                getRemainingTimeInMillis() { return 1000; }
            };

            const result = await lambda( event, context );

            expect( result ).to.equal( 42 );

            expect( context.callbackWaitsForEmptyEventLoop ).to.not.exist;
        });

        it( 'handler with context.callbackWaitsForEmptyEventLoop = false', async function() {

            let instance = new Handler();

            let lambda = instance.handler( function( event, context  ) {

                    expect( context.getRemainingTimeInMillis ).to.exist;
                    expect( context.getRemainingTimeInMillis() ).to.equal( 1000 );
                    context.callbackWaitsForEmptyEventLoop = false;

                    return 42;
                } ).createLambda();

            let event = {};
            let context = {

                getRemainingTimeInMillis() { return 1000; }
            };

            const result = await lambda( event, context );

            expect( result ).to.equal( 42 );

            expect( context.callbackWaitsForEmptyEventLoop ).to.exist;
            expect( context.callbackWaitsForEmptyEventLoop ).to.be.false;
        });

        it( 'handler (err result) with context.callbackWaitsForEmptyEventLoop = false', async function() {

            let instance = new Handler();

            let lambda = instance.handler( function( event, context  ) {

                    expect( context.getRemainingTimeInMillis ).to.exist;
                    expect( context.getRemainingTimeInMillis() ).to.equal( 1000 );
                    context.callbackWaitsForEmptyEventLoop = false;

                    throw new Error( 'bang' );
                } ).createLambda();

            let event = {};
            let context = {

                getRemainingTimeInMillis() { return 1000; }
            };

            try {

                await lambda( event, context );

                should.fail( 'should throw error' );
            }
            catch( err ) {

                expect( context.callbackWaitsForEmptyEventLoop ).to.exist;
                expect( context.callbackWaitsForEmptyEventLoop ).to.be.false;
            }
        });

        it( 'handler with context.callbackWaitsForEmptyEventLoop = false', async function() {

            let instance = new Handler();

            let lambda = instance.handler( function( event, context  ) {

                    expect( context.getRemainingTimeInMillis ).to.exist;
                    expect( context.getRemainingTimeInMillis() ).to.equal( 1000 );
                    context.callbackWaitsForEmptyEventLoop = false;

                    return 42;
                } ).createLambda();

            let event = {};
            let context = {

                getRemainingTimeInMillis() { return 1000; }
            };

            const result = await lambda( event, context );

            expect( result ).to.equal( 42 );

            expect( context.callbackWaitsForEmptyEventLoop ).to.exist;
            expect( context.callbackWaitsForEmptyEventLoop ).to.be.false;
        });

        it( 'handler (err result) with callbackWaitsForEmptyEventLoop( false ) set', async function() {

            let instance = new Handler();

            let lambda = instance.callbackWaitsForEmptyEventLoop( false )
                    .handler( function( event, context  ) {

                        expect( context.getRemainingTimeInMillis ).to.exist;
                        expect( context.getRemainingTimeInMillis() ).to.equal( 1000 );

                        throw new Error( 'bang' );
                    })
                    .createLambda();

            let event = {};
            let context = {

                getRemainingTimeInMillis() { return 1000; }
            };

            try {

                await lambda( event, context );

                should.fail( 'should throw error' );
            }
            catch( err ) {

                expect( context.callbackWaitsForEmptyEventLoop ).to.exist;
                expect( context.callbackWaitsForEmptyEventLoop ).to.be.false;
            }
        });


        it( 'fail when handler not defined', async function() {

            let lambda = new Handler().createLambda();

            let event = {};
            let context = {

                getRemainingTimeInMillis() { return 1000; }
            };

            try {

                await lambda( event, context );

                should.fail( 'should throw error' );
            }
            catch( err ) {

                expect( err.message ).to.equal( 'handler not defined' );
            }
        });

        it( 'exception throw while executing processError()', async function() {

            let instance = new Handler();

            instance.processError = async ( error, {} ) => {

                return new Promise( (resolve, reject) => {

                    setTimeout( () => {

                        reject( new Error( 'boom') );
                    }, 20);
                });
            };

            let lambda = instance.createLambda();

            let event = {};
            let context = {

                getRemainingTimeInMillis() { return 1000; }
            };

            try {

                await lambda( event, context );

                should.fail( 'should throw error' );
            }
            catch( err ) {

                expect( err.message ).to.equal( 'boom' );
            }
        });
    });
});
