'use strict';

const RecordHandler = require( './record_handler' );

class SNSHandler extends RecordHandler {

    constructor( config, handlerFunc ) {

        super( 'sns', config, handlerFunc );
    }

    topic( t ) {

        return this.appendConfiguration( { topic: t } );
    }

    addMethodsToHandler( lambdaHandler ) {

        super.addMethodsToHandler( lambdaHandler );


    }
}

module.exports = SNSHandler;
