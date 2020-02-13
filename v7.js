const { authentication, apigateway, types } = require( 'vandium' );

authentication().jwks().AWSCognito( {
    userPoolId: 'us-east-1_xxxxxxxx',
    region: 'us-east-1'
  });

exports.handler = apigateway( (event, context ) => {

            // handler here
        })
        .requiresAuthentication()
        .validateBody( {

          firstName: types.string().required(),
          lastName: types.string().required(),
          age: types.number.range( 0, 120 ).required()
        })
        .validateParameters( {} )
        .validateCookies( {} )
        .method( 'GET' );
