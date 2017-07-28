'use strict';

const TypedHandler = require( './typed' );

class RecordHandler extends TypedHandler {

    constructor( type, config, handler ) {

        super( type, config, handler );

        this.eventProcessor( (event) => event.Records );
    }
}

module.exports = RecordHandler;
