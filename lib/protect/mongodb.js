'use strict';

const Scanner = require( './scanner' );

const utils = require( '../utils' );


class MongoDBScanner extends Scanner {

    constructor( options ) {

        super( options );
    }

    scan( values ) {

        super.scan( values );

        for( let key in values ) {

            let value = values[ key ];

            if( utils.isObject( value ) ) {

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
