'use strict';

const Scanner = require( './scanner' );

const utils = require( '../utils' );

// var DISABLED_ATTACKS = [];
//
// var attacksToScanFor;


/***
 * Inspired by:
 *
 * http://www.symantec.com/connect/articles/detection-sql-injection-and-cross-site-scripting-attacks
 * http://www.troyhunt.com/2013/07/everything-you-wanted-to-know-about-sql.html
 * http://scottksmith.com/blog/2015/06/08/secure-node-apps-against-owasp-top-10-injection
 * http://www.unixwiz.net/techtips/sql-injection.html
 */

const SQL_ATTACKS = {

    ESCAPED_COMMENT: /((\%27)|(\'))\s*(\-\-)/i,

    ESCAPED_OR: /\w*\s*((\%27)|(\'))\s*((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,  // "value' or "

    ESCAPED_AND:/\w*\s*((\%27)|(\'))\s*((\%41)|a|(\%61))((\%4E)|n|(\%65))((\%44)|d|(\%64))/i,  // "value' and "

    EQUALS_WITH_COMMENT: /\s*((\%3D)|(=))[^\n]*((\%27)|(\')(\-\-)|(\%3B)|(;))/i,       // "= value 'sql_command" or "= value';sql_command"

    ESCAPED_SEMICOLON: /\w*\s*((\%27)|(\'))\s*((\%3B)|(;))/i,                          // "value';

    ESCAPED_UNION: /\w*\s*((\%27)|(\'))\s*union/i,
};

// function getAttackTypes() {
//
//     if( !attacksToScanFor ) {
//
//         attacksToScanFor = {};
//
//         Object.keys( SQL_ATTACKS ).forEach( function( key ) {
//
//             if( DISABLED_ATTACKS.indexOf( key ) == -1 ) {
//
//                 attacksToScanFor[ key ] = SQL_ATTACKS[ key ];
//             }
//         });
//     }
//
//     return attacksToScanFor;
// }

function report( key, value, attackName ) {

    console.log( '*** vandium - SQL Injection detected - ' + attackName );
    console.log( 'key =', key );
    console.log( 'value = ', value );
}

function _scan( obj, attacks, attackTypes, mode ) {

    for( let key in obj ) {

        let value = obj[ key ];

        if( utils.isString( value ) ) {

            for( var i = 0; i < attacks.length; i++ ) {

                var attackName = attacks[ i ];

                var regex = attackTypes[ attackName ];

                if( regex.test( value ) ) {

                    report( key, value, attackName );

                    if( mode === 'fail' ) {

                        var error = new Error( key + ' is invalid' );
                        error.attackType = attackName;

                        throw error;
                    }

                    break;
                }
            }
        }
        else if( utils.isObject( value ) ) {

            _scan( value, attacks, attackTypes, mode );
        }
    }
}



class SQLScanner extends Scanner {

    constructor( options ) {

        super( options );
    }

    scan( values ) {

        super.scan( values );

        let attacks = Object.keys( SQL_ATTACKS );

        _scan( values, attacks, SQL_ATTACKS, this.mode  );
    }
}


// singleton
module.exports = SQLScanner;
