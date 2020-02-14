const APIHandler = require( './api_handler' );

const APIGatewayHandler = require( './apigateway' );

const { useJwks, getConfig: getAuthConfig } = require( './authorization' );

function createLambdaHandler( handlerInstance ) {

  const authConfig = getAuthConfig();

  if( authConfig.jwk ) {

    handlerInstance.authorization( authConfig );
  }

  return handlerInstance.createLambda();
}

function api( options ) {

  return createLambdaHandler( new APIHandler( options ) );
}

function apigateway( handler ) {

  return createLambdaHandler( new APIGatewayHandler().handler( handler ) );
}

api.useJwks = useJwks;
apigateway.useJwks = useJwks;

module.exports = {

  api,
  apigateway,
};
