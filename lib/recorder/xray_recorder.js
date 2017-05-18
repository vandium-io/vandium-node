'use strict';

const AWSXRay = require( 'aws-xray-sdk-core' );

const Recorder = require( './recorder' );


class XRayRecorder extends Recorder {

    constructor() {

        this.segment = AWSXRay.getSegment().addNewSubsegment( 'vandium' );
    }

    recordEvent( event ) {

        super.recordEvent( event );

        this.segment.addMetadata( 'event', event );
    }

    close( error ) {

        super.close( error );

        this.segment.close( error );
    }
}

module.exports = XRayRecorder;
