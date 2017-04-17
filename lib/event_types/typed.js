'use strict';

const identifier = require( '@vandium/event-identifier' );

const Handler = require( './handler' );

class TypedHandler extends Handler {

    constructor( type, options ) {

        super( options );

        this.type = type;
    }

    executePreprocessors( state ) {

        super.executePreprocessors( state );
        
        let eventType = identifier.identify( state.event );

        if( this.type !== eventType ) {

            throw new Error( `Expected event type of ${this.type} but identified as ${eventType}` );
        }
    }
}

module.exports = TypedHandler;
