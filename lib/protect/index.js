'use strict';

const ValidationError = require( '../errors' ).ValidationError;

const engines = {

    sql: require( './sql' )
};

const protectState = {

    sql: { enabled: true }
};

require( '../state' ).record( 'protect', protectState );

function validate( pipelineEvent ) {

    try {

        for( let key in engines ) {

            let engine = engines[ key ];

            engine.scan( pipelineEvent.event );
        }
    }
    catch( err ) {

        throw new ValidationError( err );
    }
}

function disable( engineName ) {

    if( engineName ) {

        engines[ engineName ].disable();

        protectState[ engineName ].enabled = false;
    }
    else {

        for( let key in engines ) {

            let engine = engines[ key ];

            engine.disable();

            protectState[ key ].enabled = false;
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

    validate,

    sql: engines.sql
};
