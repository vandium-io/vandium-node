'use strict';

class Scanner {

    constructor( options = {} ) {

        let mode = options.mode;

        if( mode === 'disabled' ) {

            this.enabled = false;
        }
        else {

            this.enabled = true;

            if( mode !== 'fail' ) {

                // force to "report" mode
                mode = 'report';
            }

            this.mode = mode;
        }
    }

    scan( values ) {

        return;
    }
}

module.exports = Scanner;
