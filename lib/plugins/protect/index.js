'use strict';

const ValidationError = require( '../../errors' ).ValidationError;

const SQLScanEngine = require( './sql' );

const Plugin = require( '../plugin' );

function executeEngines( pipelineEvent, engines, index, callback ) {

    let engine = engines[ index ];

    if( engine ) {

        return engine.execute( pipelineEvent, function( err ) {

            if( err ) {

                return callback( new ValidationError( err ) );
            }

            executeEngines( pipelineEvent, engines, index + 1, callback );
        });
    }

    callback();
}

function configureDefaultState( instance, mode ) {

    if( !mode ) {

        mode = 'report';
    }

    switch( mode.toLowerCase() ) {

        case 'fail':
            instance.engines.sql.fail();
            break;

        case 'disabled':
            instance.engines.sql.disable();
            break;

        //case 'report':
        default:
            instance.engines.sql.report();
            break;
    }
}

function configureFromEnvVars( instance ) {

    let envMode = process.env.VANDIUM_PROTECT || 'report';

    let mode;

    switch( envMode.toLowerCase() ) {

        case 'true':
        case 'yes':
        case 'on':
            mode = 'fail';
            break;

        case 'false':
        case 'no':
        case 'off':
            mode = 'disabled';
            break;

        //case 'report':
        default:
            mode = 'report';
            break;
    }

    configureDefaultState( instance, mode );
}

class ProtectPlugin extends Plugin {

    constructor( state ) {

        super( 'protect', state );

        this.engines = {

            sql: new SQLScanEngine()
        }

        configureFromEnvVars( this );
    }

    execute( pipelineEvent, callback ) {

        let engines = [ this.engines.sql ];

        executeEngines( pipelineEvent, engines, 0, callback );
    }

    disable( engineName ) {

        if( engineName ) {

            let engine = this.engines[ engineName ];

            if( engine ) {

                engine.disable();
            }
        }
        else {

            for( let key in this.engines ) {

                let engine = this.engines[ key ];

                engine.disable();
            }
        }
    }

    get sql() {

        return this.engines.sql;
    }

    get state() {

        return {

            sql: this.engines.sql.state
        }
    }

    configure( config ) {

        config = config || {};

        configureDefaultState( this, config.mode );

        if( config.sql ) {

            this.engines.sql.configure( config.sql );
        }
    }
}

module.exports = ProtectPlugin;
