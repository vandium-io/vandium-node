'use strict';

const state = require( '../state' );

function recordState( engine ) {

    state.record( 'protect.' + engine.name, { enabled: engine.enabled, mode: engine.mode } );
}

class ScanEngine {

    constructor( name ) {

        this.name = name;

        this.report();
    }

    disable() {

        this.enabled = false
        recordState( this );
        return this;
    }

    report() {

        this.enabled = true;
        this.mode = 'report';

        recordState( this );

        return this;
    }

    fail() {

        this.enabled = true;
        this.mode = 'fail';

        recordState( this );

        return this;
    }

    scan( event ) {

        if( this.enabled === true ) {

            this._doScan( event );
        }
    }

    _doScan( event ) {

        // must override
        throw new Error( 'not implemented' );
    }
}

module.exports = ScanEngine;
