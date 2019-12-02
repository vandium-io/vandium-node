'use strict';

const Scanner = require( './scanner' );

const { isString, isObject } = require( '../utils' );

/***
 * Inspired by:
 *
 * http://www.symantec.com/connect/articles/detection-sql-injection-and-cross-site-scripting-attacks
 * http://www.troyhunt.com/2013/07/everything-you-wanted-to-know-about-sql.html
 * http://scottksmith.com/blog/2015/06/08/secure-node-apps-against-owasp-top-10-injection
 * http://www.unixwiz.net/techtips/sql-injection.html
 */

const ATTACK_TYPES = {

    ESCAPED_COMMENT: /((%27)|('))\s*(--)/i,

    ESCAPED_OR: /\w*\s*((%27)|('))\s*((%6F)|o|(%4F))((%72)|r|(%52))/i,  // "value' or "

    ESCAPED_AND:/\w*\s*((%27)|('))\s*((%41)|a|(%61))((%4E)|n|(%65))((%44)|d|(%64))/i,  // "value' and "

    EQUALS_WITH_COMMENT: /\s*((%3D)|(=))[^\n]*((%27)|(')(--)|(%3B)|(;))/i,       // "= value 'sql_command" or "= value';sql_command"

    ESCAPED_SEMICOLON: /\w*\s*((%27)|('))\s*((%3B)|(;))/i,                          // "value';

    ESCAPED_UNION: /\w*\s*((%27)|('))\s*union/i,
};

const ATTACKS = Object.keys( ATTACK_TYPES );

class SQLScanner extends Scanner {

    constructor( options ) {

        super( options );
    }

    scan( values ) {

        super.scan( values );

        this._scan( values );
    }

    _scan( obj ) {

        for( let key in obj ) {

            this._scanValue( obj[ key ], key );
        }
    }

    _scanValue( value, key ) {

        if( isString( value ) ) {

            for( let attackName of ATTACKS ) {

                const regex = ATTACK_TYPES[ attackName ];

                if( regex.test( value ) ) {

                    this.report( 'SQL Injection detected', key, value, attackName );
                    break;
                }
            }
        }
        else if( Array.isArray( value ) ) {

            value.forEach( (v) => this._scanValue( v, key ) );
        }
        else if( isObject( value ) ) {

            this._scan( value );
        }
    }
}


// singleton
module.exports = SQLScanner;
