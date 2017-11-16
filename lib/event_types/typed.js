'use strict';

const identifier = require( '@vandium/event-identifier' );

const Handler = require( './handler' );

class TypedHandler extends Handler {

    constructor( type, options = {} ) {

        super( options );

        this._type = type;
        this._customEvent = (options.customEvent === true);
    }

    executePreprocessors( state ) {

        super.executePreprocessors( state );

        if( !this._customEvent ) {
            
            let eventType = identifier.identify( state.event );

            if( this._type !== eventType ) {

                throw new Error( `Expected event type of ${this._type} but identified as ${eventType}` );
            }
        }
    }
}

module.exports = TypedHandler;
