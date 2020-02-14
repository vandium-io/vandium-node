const { apigateway, types } = require( 'vandium' );

apigateway.useJwks( {

  provider: 'awscognito',
  userPoolId: 'us-east-1_xxxxxxxx',
  region: 'us-east-1'
});

exports.handler = apigateway( (event, context ) => {

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
  .httpMethod( 'GET' );
