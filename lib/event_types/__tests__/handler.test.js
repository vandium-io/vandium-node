const { expect } = require( 'chai' );

const sinon = require( 'sinon' );

const Handler = require( '../handler' );

describe( 'lib/event_types/handler', function() {

  describe( 'constructor', function() {

    it( 'normal operation', function() {

      const instance = new Handler();

      expect( instance.afterFunc ).to.exist;
    });
  });

  describe( '.addMethodsToHandler', function() {

    it( 'normal operation', function() {

      const lambda = function() {};
      expect( lambda.finally ).to.not.exist;

      const instance = new Handler();

      instance.addMethodsToHandler( lambda );
      expect( lambda.finally ).to.exist;
      expect( lambda.finally ).to.be.a( 'function' );

      const finallyFunc = function() {};

      const returnValue = lambda.finally( finallyFunc );
      expect( returnValue ).to.equal( lambda );

      expect( instance.afterFunc ).to.equal( finallyFunc );
    });
  });

  describe( '.handler', function() {

    it( 'normal operation', function() {

      const instance = new Handler();

      expect( instance.executor ).to.not.exist;

      const handler = sinon.stub().returns( 42 );

      const returnValue = instance.handler( handler );
      expect( returnValue ).to.equal( instance );

      expect( handler.called ).to.be.false;

      expect( instance.executor ).to.exist;
      expect( instance.executor ).to.not.equal( handler );

      const executorReturnValue = instance.executor( {}, {} );
      expect( executorReturnValue ).to.be.instanceof( Promise );

      return executorReturnValue
          .then( (value) => {

            expect( value ).to.equal( 42 );
            expect( handler.calledOnce ).to.be.true;
          });
    });
  });

  describe( '.processResult', function() {

    it( 'normal operation', async function() {

      const instance = new Handler();

      const processed = await instance.processResult( { value: 42 }, {} );

      expect( processed ).to.eql( { result: { value: 42 } } );
    });
  });

  describe( '.processError', function() {

    it( 'normal operation', async function() {

      const instance = new Handler();

      const error = new Error( 'bang' );

      const processed = await instance.processError( error, {} );

      expect( processed ).to.eql( { error } );
    });

    it( 'normal operation (async)', async function() {

      const instance = new Handler();

      instance.processError = async ( error ) => {

        return new Promise( (resolve) => {

            setTimeout( () => {

                resolve( { error, code: '500' } );
            }, 20);
        });
      };

      const error = new Error( 'bang' );

      const processed = await instance.processError( error, {} );

      expect( processed ).to.eql( { error, code: '500' } );
    });

    it( 'exception throw while executing (async)', async function() {

      const instance = new Handler();

      instance.processError = async () => {

          return new Promise( (resolve, reject) => {

              setTimeout( () => {

                  reject( new Error( 'boom') );
              }, 20);
          });
      };

      const error = new Error( 'bang' );

      try {

          await instance.processError( error, {} );

          throw new Error( 'should not succeed' );
      }
      catch( err ) {

          expect( err.message ).to.equal( 'boom' );
      }
    });
  });

  describe( '.before', function() {

    it( 'normal operation', function() {

      const beforeFunc =  function() {};

      const instance = new Handler();

      const returnValue = instance.before( beforeFunc );
      expect( returnValue ).to.equal( instance );
    });
  });

  describe( '.callbackWaitsForEmptyEventLoop', function() {

    it( 'default operation', function() {

      const instance = new Handler();
      expect( instance._configuration.callbackWaitsForEmptyEventLoop ).to.not.exist;

      const returnValue = instance.callbackWaitsForEmptyEventLoop();
      expect( instance._configuration.callbackWaitsForEmptyEventLoop ).to.equal( true );
      expect( returnValue ).to.equal( instance );
    });

    it( 'set to false', function() {

      const instance = new Handler();
      expect( instance._configuration.callbackWaitsForEmptyEventLoop ).to.not.exist;

      const returnValue = instance.callbackWaitsForEmptyEventLoop( false );
      expect( instance._configuration.callbackWaitsForEmptyEventLoop ).to.equal( false );
      expect( returnValue ).to.equal( instance );
    });
  });

  describe( '.finally', function() {

    it( 'normal operation', function() {

      const finallyFunc = function() {};

      const instance = new Handler();
      expect( instance.afterFunc ).to.exist;
      expect( instance.afterFunc ).to.not.equal( finallyFunc );

      const returnValue = instance.finally( finallyFunc );
      expect( returnValue ).to.equal( instance );
      expect( instance.afterFunc ).to.equal( finallyFunc );
    });
  });

  describe( '.eventProcessor', function() {

    it( 'normal operation', function() {

      const instance = new Handler();

      const returnValue = instance.eventProcessor( (event) => event );
      expect( returnValue ).to.equal( instance );
    });
  });

  describe( '.execute', function() {

    it( 'handler with result, no finally', async function() {

      const instance = new Handler();

      const lambda = instance.handler( function( event, context  ) {

              expect( context.getRemainingTimeInMillis ).to.exist;
              expect( context.getRemainingTimeInMillis() ).to.equal( 1000 );

              return 42;
          } ).createLambda();

      const event = {};
      const context = {

          getRemainingTimeInMillis() { return 1000; }
      };

      const result = await lambda( event, context );

      expect( result ).to.equal( 42 );
    });

    it( 'handler with result with finally', async function() {

      const instance = new Handler();

      const after = sinon.stub().returns( 4 );

      const lambda = instance.handler( function( event, context  ) {

              expect( context.getRemainingTimeInMillis ).to.exist;
              expect( context.getRemainingTimeInMillis() ).to.equal( 1000 );

              return 42;
          } )
          .finally( after )
          .createLambda();

      const event = {};
      const context = {

          getRemainingTimeInMillis() { return 1000; }
      };

      const result = await lambda( event, context );

      expect( result ).to.equal( 42 );
      expect( after.calledOnce ).to.be.true;
    });

    it( 'handler with result with finally that throws uncaught exception', async function() {

      const instance = new Handler();

      const after = sinon.stub().throws( new Error( 'bang' ) );

      const lambda = instance.handler( function( event, context  ) {

              expect( context.getRemainingTimeInMillis ).to.exist;
              expect( context.getRemainingTimeInMillis() ).to.equal( 1000 );

              return 42;
          } )
          .finally( after )
          .createLambda();

      const event = {};
      const context = {

          getRemainingTimeInMillis() { return 1000; }
      };

      const result = await lambda( event, context );

      expect( result ).to.equal( 42 );
      expect( after.calledOnce ).to.be.true;
    });

    it( 'handler with result with async finally', async function() {

      const instance = new Handler();

      const afterStub = sinon.stub().yieldsAsync( null, 4 );
      const after = function( context, callback ) { afterStub( callback ); };

      const lambda = instance.handler( function( event, context  ) {

              expect( context.getRemainingTimeInMillis ).to.exist;
              expect( context.getRemainingTimeInMillis() ).to.equal( 1000 );

              return 42;
          } )
          .finally( after )
          .createLambda();

      const event = {};
      const context = {

          getRemainingTimeInMillis() { return 1000; }
      };

      const result = await lambda( event, context );

      expect( result ).to.equal( 42 );

      expect( afterStub.calledOnce ).to.be.true;
    });

    it( 'handler with result with finally that throws uncaught exception, additional', async function() {

      const instance = new Handler();

      const after = sinon.stub().throws( new Error( 'bang' ) );

      const lambda = instance.handler( function( event, context  ) {

              expect( context.getRemainingTimeInMillis ).to.exist;
              expect( context.getRemainingTimeInMillis() ).to.equal( 1000 );

              return 42;
          } )
          .finally( after )
          .createLambda();

      const event = {};
      const context = {

          getRemainingTimeInMillis() { return 1000; }
      };

      const result = await lambda( event, context );

      expect( result ).to.equal( 42 );
      expect( after.calledOnce ).to.be.true;
    });

    it( 'handler with result and before (sync)', async function() {

      const instance = new Handler();

      const userValue = { one: 1 };

      const beforeStub = sinon.stub().returns( userValue );

      const lambda = instance.before( beforeStub )
              .handler( function( event, context  ) {

                  expect( context.getRemainingTimeInMillis ).to.exist;
                  expect( context.getRemainingTimeInMillis() ).to.equal( 1000 );

                  expect( context.additional ).to.equal( userValue );

                  return 42;
              })
              .createLambda();

      const event = {};
      const context = {

          getRemainingTimeInMillis() { return 1000; }
      };

      const result = await lambda( event, context );

      expect( result ).to.equal( 42 );

      expect( beforeStub.calledOnce ).to.be.true;
    });

    it( 'handler with result and before (promise)', async function() {

      const instance = new Handler();

      const userValue = { one: 1 };

      const beforeStub = sinon.stub().returns( Promise.resolve( userValue ) );

      const lambda = instance.before( beforeStub )
              .handler( function( event, context  ) {

                  expect( context.getRemainingTimeInMillis ).to.exist;
                  expect( context.getRemainingTimeInMillis() ).to.equal( 1000 );

                  expect( context.additional ).to.equal( userValue );

                  return 42;
              })
              .createLambda();

      const event = {};
      const context = {

          getRemainingTimeInMillis() { return 1000; }
      };

      const result = await lambda( event, context );

      expect( result ).to.equal( 42 );
      expect( beforeStub.calledOnce ).to.be.true;
    });

    it( 'handler with result and before (async)', async function() {

      const instance = new Handler();

      const userValue = { one: 1 };

      const beforeStub = sinon.stub().yieldsAsync( null, userValue );

      const lambda = instance.before( ( context, callback ) => {

                  beforeStub( callback );
              })
              .handler( function( event, context  ) {

                  expect( context.getRemainingTimeInMillis ).to.exist;
                  expect( context.getRemainingTimeInMillis() ).to.equal( 1000 );

                  expect( context.additional ).to.equal( userValue );

                  return 42;
              })
              .createLambda();

      const event = {};
      const context = {

          getRemainingTimeInMillis() { return 1000; }
      };

      const result = await lambda( event, context );

      expect( result ).to.equal( 42 );

      expect( beforeStub.calledOnce ).to.be.true;
    });

    it( 'handler with result and before has exception', async function() {

      const instance = new Handler();

      const beforeStub = sinon.stub().yieldsAsync( new Error( 'bang' ) );

      const handlerStub = sinon.stub().returns( 42 );

      const lambda = instance.before( ( context, callback ) => {

                  beforeStub( callback );
              })
              .handler( handlerStub )
              .createLambda();

      const event = {};
      const context = {

          getRemainingTimeInMillis() { return 1000; }
      };

      try {

        await lambda( event, context );

        throw new Error( 'result shoudl not be returned' );
      }
      catch( err ) {

        expect( err.message ).to.equal( 'bang' );

        expect( beforeStub.calledOnce ).to.be.true;
        expect( handlerStub.called ).to.be.false;
      }
    });

    it( 'handler with context.callbackWaitsForEmptyEventLoop = true', async function() {

      const instance = new Handler();

      const lambda = instance.handler( function( event, context  ) {

              expect( context.getRemainingTimeInMillis ).to.exist;
              expect( context.getRemainingTimeInMillis() ).to.equal( 1000 );
              context.callbackWaitsForEmptyEventLoop = true;

              return 42;
          } ).createLambda();

      const event = {};
      const context = {

          getRemainingTimeInMillis() { return 1000; }
      };

      const result = await lambda( event, context );

      expect( result ).to.equal( 42 );

      expect( context.callbackWaitsForEmptyEventLoop ).to.not.exist;
    });

    it( 'handler with context.callbackWaitsForEmptyEventLoop = false', async function() {

      const instance = new Handler();

      const lambda = instance.handler( function( event, context  ) {

              expect( context.getRemainingTimeInMillis ).to.exist;
              expect( context.getRemainingTimeInMillis() ).to.equal( 1000 );
              context.callbackWaitsForEmptyEventLoop = false;

              return 42;
          } ).createLambda();

      const event = {};
      const context = {

          getRemainingTimeInMillis() { return 1000; }
      };

      const result = await lambda( event, context );

      expect( result ).to.equal( 42 );

      expect( context.callbackWaitsForEmptyEventLoop ).to.exist;
      expect( context.callbackWaitsForEmptyEventLoop ).to.be.false;
    });

    it( 'handler (err result) with context.callbackWaitsForEmptyEventLoop = false, error', async function() {

      const instance = new Handler();

      const lambda = instance.handler( function( event, context  ) {

              expect( context.getRemainingTimeInMillis ).to.exist;
              expect( context.getRemainingTimeInMillis() ).to.equal( 1000 );
              context.callbackWaitsForEmptyEventLoop = false;

              throw new Error( 'bang' );
          } ).createLambda();

      const event = {};
      const context = {

          getRemainingTimeInMillis() { return 1000; }
      };

      try {

        await lambda( event, context );

        throw new Error( 'should throw error' );
      }
      catch( err ) {

        expect( context.callbackWaitsForEmptyEventLoop ).to.exist;
        expect( context.callbackWaitsForEmptyEventLoop ).to.be.false;
      }
    });

    it( 'handler with context.callbackWaitsForEmptyEventLoop = false, result', async function() {

      const instance = new Handler();

      const lambda = instance.handler( function( event, context  ) {

              expect( context.getRemainingTimeInMillis ).to.exist;
              expect( context.getRemainingTimeInMillis() ).to.equal( 1000 );
              context.callbackWaitsForEmptyEventLoop = false;

              return 42;
          } ).createLambda();

      const event = {};
      const context = {

          getRemainingTimeInMillis() { return 1000; }
      };

      const result = await lambda( event, context );

      expect( result ).to.equal( 42 );

      expect( context.callbackWaitsForEmptyEventLoop ).to.exist;
      expect( context.callbackWaitsForEmptyEventLoop ).to.be.false;
    });

    it( 'handler (err result) with callbackWaitsForEmptyEventLoop( false ) set', async function() {

      const instance = new Handler();

      const lambda = instance.callbackWaitsForEmptyEventLoop( false )
              .handler( function( event, context  ) {

                  expect( context.getRemainingTimeInMillis ).to.exist;
                  expect( context.getRemainingTimeInMillis() ).to.equal( 1000 );

                  throw new Error( 'bang' );
              })
              .createLambda();

      const event = {};
      const context = {

          getRemainingTimeInMillis() { return 1000; }
      };

      try {

        await lambda( event, context );

        throw new Error( 'should throw error' );
      }
      catch( err ) {

        expect( context.callbackWaitsForEmptyEventLoop ).to.exist;
        expect( context.callbackWaitsForEmptyEventLoop ).to.be.false;
      }
    });


    it( 'fail when handler not defined', async function() {

      const lambda = new Handler().createLambda();

      const event = {};
      const context = {

          getRemainingTimeInMillis() { return 1000; }
      };

      try {

        await lambda( event, context );

        throw new Error( 'should throw error' );
      }
      catch( err ) {

        expect( err.message ).to.equal( 'handler not defined' );
      }
    });

    it( 'exception throw while executing processError()', async function() {

      const instance = new Handler();

      instance.processError = async () => {

          return new Promise( (resolve, reject) => {

              setTimeout( () => {

                  reject( new Error( 'boom') );
              }, 20);
          });
      };

      const lambda = instance.createLambda();

      const event = {};
      const context = {

          getRemainingTimeInMillis() { return 1000; }
      };

      try {

        await lambda( event, context );

        throw new Error( 'should throw error' );
      }
      catch( err ) {

        expect( err.message ).to.equal( 'boom' );
      }
    });
  });

  describe( '.setFeature', function() {

    it( 'default state', function() {

      const instance = new Handler();

      expect( instance.features() ).to.eql( {} );
    });

    it( 'normal operation', function() {

      const instance = new Handler();

      instance.setFeature( 'myFeature', { whatever: true } );

      expect( instance.features() ).to.eql( {

        myFeature: { whatever: true },
      });

      // additional
      instance.setFeature( 'myOtherFeature', { enabled: true } );

      expect( instance.features() ).to.eql( {

        myFeature: { whatever: true },
        myOtherFeature: { enabled: true },
      });

      // overwrite
      instance.setFeature( 'myOtherFeature', { number: 42 } );

      expect( instance.features() ).to.eql( {

        myFeature: { whatever: true },
        myOtherFeature: { number: 42 },
      });
    });
  });
});
