const constants = require( './constants' );

const BaseAPIHandler = require( './base_api_handler' );

class APIHandler extends BaseAPIHandler {

  constructor( options = {} ) {

    super( options );
  }

  addMethodsToHandler( lambdaHandler ) {

    super.addMethodsToHandler( lambdaHandler );

    [
      'jwt',
      'authorization',
      'validation',
      'handler'

    ].forEach( (handlerMethod) => this.addlambdaHandlerMethod( handlerMethod, lambdaHandler ) );

    constants.HTTP_METHODS.forEach( (methodType) => {

      this.addlambdaHandlerMethod( methodType, lambdaHandler );
      this.addlambdaHandlerMethod( methodType.toLowerCase(), lambdaHandler );
    });
  }
}

// add http methods to APIHandler class
constants.HTTP_METHODS.forEach( (methodType) => {

    APIHandler.prototype[ methodType ] = function( ...args ) {

        return this._addHandler( methodType, ...args );
    };
});


module.exports = APIHandler;
