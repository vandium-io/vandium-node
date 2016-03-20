'use strict';

var ValidationError = require( '../errors' ).ValidationError;

var engines = { };

function sql() {

    if( !engines.sql ) {

        engines.sql = require( './sql' );
    }

    return engines.sql;
}

function scan( event ) {

    try {

        Object.keys( engines ).forEach( function( key ) {

            engines[ key ].scan( event );
        });
    }
    catch( err ) {

        throw new ValidationError( err );
    }
}

module.exports = {

    sql: sql,

    scan: scan,
};
