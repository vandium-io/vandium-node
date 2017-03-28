'use strict';

class Scanner {

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

    scan( values ) {

        return;
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
}

module.exports = Scanner;
