'use strict';

const Plugin = require( '../plugin' );

class ScanEngine extends Plugin {

    constructor( name ) {

        super( 'protect_' + name );

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

    execute( pipelineEvent, callback ) {

        try {

            if( this.enabled === true ) {

                this._doScan( pipelineEvent.event );
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
    }

    _doScan( event ) {

        // must override
        throw new Error( 'not implemented' );
    }

    get state() {

        let state = { enabled: this.enabled };

        if( this.enabled === true ) {

            state.mode = this.mode;
        }

        return state;
    }
}

module.exports = ScanEngine;
