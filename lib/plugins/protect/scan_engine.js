'use strict';

const Plugin = require( '../plugin' );

class ScanEngine extends Plugin {

    constructor( name, scanner ) {

        super( 'protect_' + name );

        this.lambdaProxy = false;

        this.scanner = scanner;
        this.scanner.report();
    }

    disable() {

        this.scanner.disable();

        return this;
    }

    report() {

        this.scanner.report();

        return this;
    }

    fail() {

        this.scanner.fail();

        return this;
    }

    enableLambdaProxy( lambdaProxy ) {

        this.lambdaProxy = (lambdaProxy === true);

        return this;
    }

    execute( pipelineEvent, callback ) {

        try {

            if( this.scanner.enabled === true ) {

                let event = pipelineEvent.event;

                if( this.lambdaProxy ) {

                    this.scanner.scan( event.queryStringParameters || {} );
                    this.scanner.scan( event.body || {} );
                }
                else {

                    this.scanner.scan( event );
                }
            }

            callback();
        }
        catch( err ) {

            callback( err );
        }
    }

    configure( config ) {

        this.scanner.configure( config );

        this.lambdaProxy = (config.lambdaProxy === true);
    }

    get state() {

        let state = { enabled: this.scanner.enabled };

        if( this.scanner.enabled === true ) {

            state.mode = this.scanner.mode;

            state.lambdaProxy = (this.lambdaProxy === true);
        }

        return state;
    }
}

module.exports = ScanEngine;
