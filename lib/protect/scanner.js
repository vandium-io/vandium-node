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

    scan( /*values*/ ) {

        return;
    }

    report( message, key, value, attackType ) {

        console.log( '*** vandium -', message );
        console.log( 'key =', key );
        console.log( 'value = ', value );

        if( this.mode === 'fail' ) {

            let err = new Error( key + ' is invalid' );
            err.attackType = attackType;

            throw err;
        }
    }
}

module.exports = Scanner;
