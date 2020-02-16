const { useJwks, createHandler, types } = require( 'vandium' );

// defined in
// process.env.VANDIUM_AUTH_JWKS = 'awscognito:userPoolId:us-east-1_xxxxxxxx,region=us-east_1'
useJwks();

exports.handler = createHandler( ( { apigateway } ) =>

    apigateway( ( event, context ) => {

          // handler here
    })
    .requiresAuthorization()
    .validation( {

      body: {

        firstName: types.string().required(),
        lastName: types.string().required(),
        age: types.number.range( 0, 120 ).required(),
      }
    })
    .httpMethod( 'GET' )
  );
