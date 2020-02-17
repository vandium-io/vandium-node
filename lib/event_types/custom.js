const Handler = require( './handler' );

class CustomHandler extends Handler {

    constructor() {

        super();
    }

    addMethodsToHandler( lambdaHandler ) {

        super.addMethodsToHandler( lambdaHandler );

        this.addlambdaHandlerMethod( 'handler', lambdaHandler );
    }
}

function createHandler( handler, options ) {

    const instance = new CustomHandler( options );

    if( handler ) {

      instance.handler( handler );
    }

    return instance.createLambda();
}

module.exports = createHandler;
