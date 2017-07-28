'use strict';

const RecordHandler = require( './record_handler' );

class S3Handler extends RecordHandler {

    constructor( config, handlerFunc ) {

        super( 's3', config, handlerFunc );
    }

    bucket( b ) {

        return this.appendConfiguration( { bucket: b } );
    }

    event( e ) {

        return this.appendConfiguration( { event: e } );
    }

    rules( r ) {

        return this.appendConfiguration( { rules: r } );
    }
}

module.exports = S3Handler;
