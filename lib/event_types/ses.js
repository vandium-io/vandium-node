'use strict';

const RecordHandler = require( './record_handler' );

class SESHandler extends RecordHandler {

    constructor( config, handlerFunc ) {

        super( 'ses', config, handlerFunc );
    }
}

module.exports = SESHandler;
