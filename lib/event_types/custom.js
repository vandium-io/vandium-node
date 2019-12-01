const Handler = require( './handler' );

class CustomHandler extends Handler {

    constructor( options = {} ) {

        super( options );
    }

    addMethodsToHandler( lambdaHandler ) {

        super.addMethodsToHandler( lambdaHandler );

        this.addlambdaHandlerMethod( 'handler', lambdaHandler );
    }
}

function createHandler( options ) {

    return new CustomHandler( options )
        .createLambda();
}

module.exports = createHandler;
