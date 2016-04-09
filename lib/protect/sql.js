'use strict';

const _ = require( 'lodash' );

var DISABLED_ATTACKS = [];

var attacksToScanFor;

var preventAction = 'report';

/***
 * Inspired by:
 *
 * http://www.symantec.com/connect/articles/detection-sql-injection-and-cross-site-scripting-attacks
 * http://www.troyhunt.com/2013/07/everything-you-wanted-to-know-about-sql.html
 * http://scottksmith.com/blog/2015/06/08/secure-node-apps-against-owasp-top-10-injection
 * http://www.unixwiz.net/techtips/sql-injection.html
 */

var SQL_ATTACKS = {

    ESCAPED_COMMENT: /((\%27)|(\'))\s*(\-\-)/i,

    ESCAPED_OR: /\w*\s*((\%27)|(\'))\s*((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,  // "value' or "

    ESCAPED_AND:/\w*\s*((\%27)|(\'))\s*((\%41)|a|(\%61))((\%4E)|n|(\%65))((\%44)|d|(\%64))/i,  // "value' and "

    EQUALS_WITH_COMMENT: /\s*((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,       // "= value 'sql_command" or "= value';sql_command"

    ESCAPED_SEMICOLON: /\w*\s*((\%27)|(\'))\s*((\%3B)|(;))/i,                          // "value';

    ESCAPED_UNION: /\w*\s*((\%27)|(\'))\s*union/i,
};

function getAttackTypes() {

    if( !attacksToScanFor ) {

        attacksToScanFor = {};

        Object.keys( SQL_ATTACKS ).forEach( function( key ) {

            if( _.indexOf( DISABLED_ATTACKS, key ) == -1 ) {

                attacksToScanFor[ key ] = SQL_ATTACKS[ key ];
            }
        });
    }

    return attacksToScanFor;
}

function reportOnly() {

    preventAction = 'report';
}

function throwException() {

    preventAction = 'throw';
}

function report( key, value, attackName ) {

    console.log( '*** vandium - SQL Injection detected - ' + attackName );
    console.log( 'key =', key );
    console.log( 'value = ', value );
}

function scan( event ) {

    var attackTypes = getAttackTypes();

    var attacks = Object.keys( attackTypes );

    _scan( event, attacks, attackTypes );
}

function _scan( obj, attacks, attackTypes ) {

    Object.keys( obj ).forEach( function( key ) {

        var value = obj[ key ];

        if( _.isString( value ) ) {

            for( var i = 0; i < attacks.length; i++ ) {

                var attackName = attacks[ i ];

                var regex = attackTypes[ attackName ];

                if( regex.test( value ) ) {

                    report( key, value, attackName );

                    if( preventAction === 'throw' ) {

                        var error = new Error( key + ' is invalid' );
                        error.attackType = attackName;

                        throw error;
                    }

                    break;
                }
            }
        }
        else if( _.isObject( value ) ) {

            _scan( value, attacks, attackTypes );
        }
    });
}

module.exports = {

    report: reportOnly,

    fail: throwException,

    scan: scan,
};
