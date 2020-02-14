const BaseAPIHandler = require( './base_api_handler' );

const MethodHandler = require( './method' );

const { HTTP_METHODS } = require( './constants' );

class APIGateway extends BaseAPIHandler {

  constructor() {

    super();

    // match all methods
    this.methodHandler = new MethodHandler();
    this.methodTypes = [ '*' ];

    // cors allowed by default
    this.cors();

    this.pipeline.stage( 'methodValidation', (state) => {

      const { event: { httpMethod : method } } = state;

      if( this.methodTypes[0] !== '*' && !this.methodTypes.includes( method.toUpperCase() ) ) {

        throw new Error( `Handler not compatible for http method: ${method}` );
      }

      state.extra = { method, methodHandler: this.methodHandler };
    });
  }

  requiresAuthorization( options ) {

    this.authorization( options );
  }

  httpMethod( typeOrTypes ) {

    let types;

    if( Array.isArray( typeOrTypes ) ) {

      types = [ ...typeOrTypes ];
    }
    else {

      types = [ typeOrTypes ];
    }

    types.forEach( (type) => {

      if( type !== '*' && !HTTP_METHODS.includes( type.toUpperCase() ) ) {

        throw new Error( `Unknown method: ${type}` );
      }
    });

    this.methodTypes = types.map( t => t.toUpperCase() );
  }

  addMethodsToHandler( lambdaHandler ) {

    super.addMethodsToHandler( lambdaHandler );

    [
      'requiresAuthorization',
      'httpMethod',

    ].forEach( (handlerMethod) => this.addlambdaHandlerMethod( handlerMethod, lambdaHandler ) );
  }

  currentMethodHandler() {

    return this.methodHandler;
  }
}

module.exports = APIGateway;
