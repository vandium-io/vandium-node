const { expect } = require( 'chai' );

const sinon = require( 'sinon' );

const createHandler = require( '../create-handler' );

describe( 'lib/create-handler', function() {

  describe( 'createHandler', function() {

    it( 'normal operation', async function() {

      const handler = createHandler( ( types ) => {

        const controlTypes = [
          'api',
          'apigateway',
          'dynamodb',
          'sns',
          'ses',
          'kinesis',
          'sqs',
          's3',
          'firehose',
          'lex',
          'cognito',
          'cloudformation',
          'logs',
          'config',
          'iotButton',
          'generic',
        ];

        for( let type of controlTypes ) {

          expect( types[ type ] ).to.be.a( 'function' );
        }

        // use s3
        return types.generic( () => {} );
      })

      expect( handler ).to.be.a( 'function' );
      expect( handler.withHooks ).to.be.a( 'function' );
      expect( handler.features ).to.eql( {} );
    });

    it( 'lambda handler', async function() {

      const innerHandler = sinon.stub();

      const handler = createHandler( ( { generic } ) => generic( innerHandler ) );

      const event = { whatever: 42 };
      const context = { contextValue: 42 };
      innerHandler.resolves( 'ok' );

      const result = await handler( event, context );

      expect( result ).to.equal( 'ok' );

      expect( innerHandler.called ).to.be.true;
      expect( innerHandler.firstCall.args.length ).to.equal( 2 );

      expect( innerHandler.firstCall.args[0] ).to.not.equal( event );
      expect( innerHandler.firstCall.args[0] ).to.eql( event );
      expect( innerHandler.firstCall.args[1].contextValue ).to.equal( 42 );
      expect( innerHandler.firstCall.args[1].event ).to.eql( event );
    });

    it( 'lambda handler with hooks', async function() {

      const innerHandler = sinon.stub();

      const lambdaHandler = createHandler( ( { generic } ) => generic( innerHandler ) );

      const runStub = sinon.stub().resolves( 'hello' );

      const handler = lambdaHandler.withHooks( {

          runHandler: {

            stub:runStub
          }
        });

      const event = { whatever: 42 };
      const context = { contextValue: 42 };
      innerHandler.resolves( 'ok' );

      const result = await handler( event, context );

      expect( result ).to.equal( 'hello' );

      expect( innerHandler.called ).to.be.false;
      expect( runStub.called ).to.be.true;
    });

    it( 'fail when handler not returned', function() {

      expect( createHandler.bind( null, () => {} ) ).to
        .throw( 'Handler must be returned when using createHandler()' );
    });

    it( 'fail when handler returns object without execute()', function() {

      expect( createHandler.bind( null, () => ({}) ) ).to
        .throw( 'Handler does not contain execute(), are you sure that you returned the correct value?' );
    });
  });
});
