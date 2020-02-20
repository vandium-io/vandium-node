const { expect } = require( 'chai' );

const sinon = require( 'sinon' );

const APIGateway = require( '../apigateway' );

const LambdaTester = require( 'lambda-tester' );

const { reset: resetAuth, useJwks } = require( '../../../auth/auth' );

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

      before( function() {

        resetAuth();
      });

      afterEach( function() {

        resetAuth();
      });

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

      it( 'when jwk is set in auth', function() {

        const jwk = {

          alg: 'RS256',
          e: 'AQAB',
          kid: '4fsZKEn++NgBOqrbtInEg62ykVmpJTWzHp7pQ8f3fz0=',
          kty: 'RSA',
          n: 'jHcU9OrRuZdy0q1olkrNp0Ctl0gAi76ajBd3nyBLae6-IH7vnFrWSlWl3s66bLYT8fvy9lUt2hFA8ulsCvrwIWNoWEUuxdao9KMKuK4n9MGQSDmgBQyDkG4qmIp6i7JZlkuTSPziJPMpS0SxbMp6cSYZg7PiY7FOuKe5RDHvpvkQlvgdMjO_-dRguNvWw9E3lGe2WfwLy6bo0JVVl5BunMRI7zKlBszVtA3nUd-XWa0rl-KrGxZGzkxs3Ep1C0HrbAPSE3KhBIJL7xFloMooNP__C98PY74F30pkbO38SqL7seezC5ZM89DEA7XHFysE-T42VBPH2lhaA5Dznwg_qw',
          use: 'sig'
        };

        useJwks( { jwk } );

        const instance = new APIGateway();

        const returnValue = instance.requiresAuthorization();

        const features = returnValue.features();

        expect( features.jwt ).to.exist;
        expect( features.jwt.enabled ).to.be.true;
        expect( features.jwt.algorithm ).to.equal( 'RS256' );
      })

      it( 'when jwk is set in auth, but false supplied', function() {

        const jwk = {

          alg: 'RS256',
          e: 'AQAB',
          kid: '4fsZKEn++NgBOqrbtInEg62ykVmpJTWzHp7pQ8f3fz0=',
          kty: 'RSA',
          n: 'jHcU9OrRuZdy0q1olkrNp0Ctl0gAi76ajBd3nyBLae6-IH7vnFrWSlWl3s66bLYT8fvy9lUt2hFA8ulsCvrwIWNoWEUuxdao9KMKuK4n9MGQSDmgBQyDkG4qmIp6i7JZlkuTSPziJPMpS0SxbMp6cSYZg7PiY7FOuKe5RDHvpvkQlvgdMjO_-dRguNvWw9E3lGe2WfwLy6bo0JVVl5BunMRI7zKlBszVtA3nUd-XWa0rl-KrGxZGzkxs3Ep1C0HrbAPSE3KhBIJL7xFloMooNP__C98PY74F30pkbO38SqL7seezC5ZM89DEA7XHFysE-T42VBPH2lhaA5Dznwg_qw',
          use: 'sig'
        };

        useJwks( { jwk } );

        const instance = new APIGateway();

        const returnValue = instance.requiresAuthorization( false );

        const features = returnValue.features();

        expect( features.jwt ).to.exist;
        expect( features.jwt.enabled ).to.be.false;
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
