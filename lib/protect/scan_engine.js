'use strict';

class ScanEngine {

    constructor() {

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
