const APIHandler = require( './api_handler' );

const APIGateway = require( './apigateway' );

function api( options ) {

  return new APIHandler( options ).createLambda();
}

function apigateway( handler ) {

  return new APIGateway().handler( handler );
}

module.exports = {

  api,
  apigateway,
};
