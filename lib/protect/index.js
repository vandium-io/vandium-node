'use strict';

var ValidationError = require( '../errors' ).ValidationError;

var engines = {};

function getEngine( name ) {

    if( !engines[ name ] ) {

        engines[ name ] = require( './' + name );
    }

    return engines[ name ];
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

function disable( engineName ) {

    if( engineName ) {

        delete engines[ engineName ];
    }
    else {

        engines = {};
    }
}


module.exports = {

    disable: disable,

    scan: scan,
};


// default - enable SQL report only
getEngine( 'sql' ).report();

Object.defineProperty( module.exports, 'sql', {

    get: function() {

        return getEngine( 'sql' );
    }
});


