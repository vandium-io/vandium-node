const { identify } = require( '@vandium/event-identifier' );

const Handler = require( './handler' );

class TypedHandler extends Handler {

    constructor( type, options = {} ) {

        super( options );

        this._type = type;
        this._customEvent = (options.customEvent === true);
    }

    matchSubType( subType ) {

        this._subType = subType;
        return this;
    }

    executePreprocessors( state ) {

        super.executePreprocessors( state );

        if( !this._customEvent ) {

            let { type, source } = identify( state.event );

            if( this._type !== type ) {

                throw new Error( `Expected event type of ${this._type} but identified as ${type}` );
            }

            if( this._subType && (this._subType !== source) ) {

                throw new Error( `Expected event source of ${this._subType} but identified as ${source}` );
            }
        }
    }
}

module.exports = TypedHandler;
