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

            let { type } = identifier.identify( state.event );

            if( this._type !== type ) {

                throw new Error( `Expected event type of ${this._type} but identified as ${type}` );
            }
        }
    }
}

module.exports = TypedHandler;
