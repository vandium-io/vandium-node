const Scanner = require( './scanner' );

const { isObject } = require( '../utils' );


class MongoDBScanner extends Scanner {

    constructor( options ) {

        super( options );
    }

    scan( values ) {

        super.scan( values );

        for( let key in values ) {

            const value = values[ key ];

            if( isObject( value ) ) {

                this._scanChildObject( key, value );
            }
        }
    }

    _scanChildObject( key, obj ) {

        for( let k in obj ) {

            if( k.charAt( 0 ) === '$' ) {

                this.report( 'MongoDB attack detected', key, obj, 'INJECTION_ATTACK' );
            }
        }
    }
}


module.exports = MongoDBScanner;
