const constants = require( './constants' );

const MethodHandler = require( './method' );

const BaseAPIHandler = require( './base_api_handler' );

class APIHandler extends BaseAPIHandler {

  constructor( options = {} ) {

    super( options );

    this.methodHandlers = {};
    this._currentMethodHandler = null;

    this.pipeline.stage( 'methodValidation', (state) => {

        let { event } = state;

        let method = event.httpMethod;

        let methodHandler = this.methodHandlers[ method ];

        if( !methodHandler ) {

            throw new Error( 'handler not defined for http method: ' + method );
        }

        state.extra = { method, methodHandler };
    });
  }

  currentMethodHandler() {

      if( !this._currentMethodHandler ) {

          throw new Error( 'Method not selected' );
      }

      return this._currentMethodHandler;
  }

  addMethodsToHandler( lambdaHandler ) {

    super.addMethodsToHandler( lambdaHandler );

    [
      'jwt',
      'authorization',
      'handler'

    ].forEach( (handlerMethod) => this.addlambdaHandlerMethod( handlerMethod, lambdaHandler ) );

    constants.HTTP_METHODS.forEach( (methodType) => {

      this.addlambdaHandlerMethod( methodType, lambdaHandler );
      this.addlambdaHandlerMethod( methodType.toLowerCase(), lambdaHandler );
    });
  }

  _addHandler( type, ...args ) {

      const methodHandler = new MethodHandler();

      if( args.length > 1 ) {

          methodHandler.setValidation( args[ 0 ] );
          methodHandler.setHandler( args[ 1 ] );
      }
      else if( args.length === 1 ) {

          methodHandler.setHandler( args[ 0 ] );
      }

      this.methodHandlers[ type ] = methodHandler;
      this._currentMethodHandler = methodHandler;

      return this;
  }
}

// add http methods to APIHandler class
constants.HTTP_METHODS.forEach( (methodType) => {

    APIHandler.prototype[ methodType ] = function( ...args ) {

        return this._addHandler( methodType, ...args );
    };
});


module.exports = APIHandler;
