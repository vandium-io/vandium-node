'use strict';

const ValidationError = require( '../errors' ).ValidationError;

const engines = {

    sql: require( './sql' )
};

function scan( event ) {

    try {

        for( let key in engines ) {

            let engine = engines[ key ];

            engine.scan( event );
        }
    }
    catch( err ) {

        throw new ValidationError( err );
    }
}

function disable( engineName ) {

    if( engineName ) {

        engines[ engineName ].disable();
    }
    else {

        for( let key in engines ) {

            let engine = engines[ key ];

            engine.disable();
        }
    }
}

function configureFromEnvVars() {

    let mode = process.env.VANDIUM_PROTECT || 'report';

    switch( mode.toLowerCase() ) {

        case 'true':
        case 'yes':
        case 'on':
            engines.sql.fail();
            break;

        case 'false':
        case 'no':
        case 'off':
            engines.sql.disable();
            break;

        //case 'report':
        default:
            engines.sql.report();
            break;
    }
}

configureFromEnvVars();

module.exports = {

    disable,

    scan,

    sql: engines.sql
};
