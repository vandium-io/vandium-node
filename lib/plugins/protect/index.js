'use strict';

const ValidationError = require( '../../errors' ).ValidationError;

const SQLScanEngine = require( './sql' );

const Plugin = require( '../plugin' );

//require( '../../state' ).record( 'protect', protectState );

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

class ProtectPlugin extends Plugin {

    constructor( state ) {

        super( 'protect', state );

        this.engines = {

            sql: new SQLScanEngine()
        }
    }

    execute( pipelineEvent, callback ) {

        executeEngines( pipelineEvent, this.engines, 0, callback );
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

        let mode = process.env.VANDIUM_PROTECT || 'report';

        switch( mode.toLowerCase() ) {

            case 'true':
            case 'yes':
            case 'on':
                this.engines.sql.fail();
                break;

            case 'false':
            case 'no':
            case 'off':
                this.engines.sql.disable();
                break;

            //case 'report':
            default:
                this.engines.sql.report();
                break;
        }

        for( let key in this.engines ) {

            let engine = this.engines[ key ];

            engine.configure( config );
        }
    }
}

module.exports = ProtectPlugin;
