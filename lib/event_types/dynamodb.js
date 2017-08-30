'use strict';

const RecordHandler = require( './record_handler' );

class DynamoDBHandler extends RecordHandler {

    constructor( config, handlerFunc ) {

        super( 'dynamodb', config, handlerFunc );

        this._configuration.stream = [];
    }

    stream( s ) {

        this._configuration.stream.push( s );

        return this;
    }

    arn( a ) {

        return this.stream( { arn: a } );
    }

    addMethodsToHandler( lambdaHandler ) {

        super.addMethodsToHandler( lambdaHandler );


    }
}

module.exports = DynamoDBHandler;
