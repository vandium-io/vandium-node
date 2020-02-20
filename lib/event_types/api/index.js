const APIHandler = require( './api_handler' );

const APIGateway = require( './apigateway' );

const { isEnabled: isAuthEnabled, load: loadAuth } = require( '../../auth' );

function api( options ) {

  loadAuth();

  return new APIHandler( options ).createLambda();
}

function apigateway( handler ) {

  const instance = new APIGateway().handler( handler );

  if( isAuthEnabled() ) {

    loadAuth();

    // enabled auth
    instance.requiresAuthorization();
  }

  return instance;
}

module.exports = {

  api,
  apigateway,
};
