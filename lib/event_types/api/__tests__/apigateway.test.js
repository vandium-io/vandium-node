const { expect } = require( 'chai' );

const sinon = require( 'sinon' );

const APIGateway = require( '../apigateway' );

const LambdaTester = require( 'lambda-tester' );

describe( 'lib/event_types/api/apigateway', function() {

  describe( 'APIGateway', function() {

    describe( 'constructor', function() {

      it( 'no options', function() {

        let instance = new APIGateway();

        expect( instance._type ).to.equal( 'apigateway' );

        expect( instance._headers ).to.eql( {

          // cors enabled by default
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true',
        } );

        expect( instance._protection ).to.exist;
        expect( instance._protection.sql.mode ).to.equal( 'report' );

        expect( instance.methodTypes ).to.eql( [ '*' ] );
        expect( instance._onErrorHandler ).to.exist;
        expect( instance.afterFunc ).to.exist;
        expect( instance._onErrorHandler ).to.exist;
      });
    });

    describe( 'httpMethod', function() {

      it( 'single value', function() {

        let instance = new APIGateway();

        const returnValue = instance.httpMethod( 'get' );

        expect( returnValue ).to.equal( instance );
        expect( instance.methodTypes ).to.eql( [ 'GET'] );
      });

      it( 'multiple values', function() {

        let instance = new APIGateway();

        const returnValue = instance.httpMethod( [ 'put', 'Patch' ] );

        expect( returnValue ).to.equal( instance );
        expect( instance.methodTypes ).to.eql( [ 'PUT', 'PATCH' ] );
      });

      it( 'fail when method is unknown', function() {

        let instance = new APIGateway();

        expect( instance.httpMethod.bind( instance, 'super-post' ) ).to.throw( 'Unknown method: super-post' );
      });
    });

    describe( '.requiresAuthorization', function() {

      it( 'normal operation', function() {

        let instance = new APIGateway();

        let returnValue = instance.requiresAuthorization( {

            algorithm: 'HS256',
            key: 'secret'
        });

        expect( returnValue ).to.equal( instance );
      });

      it( 'fail when called without arguments', function() {

        let instance = new APIGateway();

        expect( instance.requiresAuthorization.bind( instance ) ).to.throw( 'authentication error: missing algorithm' );
      });

      it( 'called with false', function() {

        const instance = new APIGateway();

        const returnValue = instance.requiresAuthorization( false );

        expect( returnValue ).to.equal( instance );
      });
    });

    describe( '.execute', function() {

      it( 'normal operation', async function() {

        const innnerHandler = sinon.stub().resolves( 'ok' );

        const instance = new APIGateway().handler( innnerHandler );

        await LambdaTester( (event,context) => instance.execute( event, context ) )
                .event( (mocks) => mocks.apiGateway()
                          .path( '/whatever' )
                          .method( 'GET' )
                          .build()
                )
                .expectResult( (result) => {

                  expect( result ).to.eql( {
                    statusCode: 200,
                    headers: {
                      'Access-Control-Allow-Origin': '*',
                      'Access-Control-Allow-Credentials': 'true'
                    },
                    body: 'ok',
                    isBase64Encoded: false
                  });
                });
      });

      it( 'fail when httpMethod is does not match', async function() {

        const innnerHandler = sinon.stub().resolves( 'ok' );

        const instance = new APIGateway().handler( innnerHandler ).httpMethod( 'PUT' );

        await LambdaTester( (event,context) => instance.execute( event, context ) )
                .event( (mocks) => mocks.apiGateway()
                          .path( '/whatever' )
                          .method( 'GET' )
                          .build()
                )
                .expectResult( (result) => {

                  expect( result ).to.eql( {
                    statusCode: 500,
                    headers: {
                      'Access-Control-Allow-Origin': '*',
                      'Access-Control-Allow-Credentials': 'true'
                    },
                    body: '{"type":"Error","message":"Handler not compatible for http method: GET"}',
                    isBase64Encoded: false
                  });
                });
      });
    });
  });
});
