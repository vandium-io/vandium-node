'use strict';

const Plugin = require( '../plugin' );

function lambdaProxyFilter( key ) {

    switch( key ) {

        case 'body':
        case 'queryStringParameters':
            return true;
    }

    return false;
}

class ScanEngine extends Plugin {

    constructor( name ) {

        super( 'protect_' + name );

        this.lambdaProxy = false;

        this.report();
    }

    disable() {

        this.enabled = false

        return this;
    }

    report() {

        this.enabled = true;
        this.mode = 'report';

        return this;
    }

    fail() {

        this.enabled = true;
        this.mode = 'fail';

        return this;
    }

    enableLambdaProxy( lambdaProxy ) {

        this.lambdaProxy = (lambdaProxy === true);

        return this;
    }

    execute( pipelineEvent, callback ) {

        try {

            if( this.enabled === true ) {

                let filter = null;

                if( this.lambdaProxy ) {

                    filter = lambdaProxyFilter;
                }

                this._doScan( pipelineEvent.event, filter );
            }

            callback();
        }
        catch( err ) {

            callback( err );
        }
    }

    configure( config ) {

        let mode = config.mode || 'report';

        switch( mode ) {

            case 'disabled':
                this.disable();
                break;

            case 'report':
                this.report();
                break;

            case 'fail':
                this.fail();
                break;
        }

        this.lambdaProxy = (config.lambdaProxy === true);
    }

    _doScan( event ) {

        // must override
        throw new Error( 'not implemented' );
    }

    get state() {

        let state = { enabled: this.enabled };

        if( this.enabled === true ) {

            state.mode = this.mode;

            state.lambdaProxy = (this.lambdaProxy === true);
        }

        return state;
    }
}

module.exports = ScanEngine;
