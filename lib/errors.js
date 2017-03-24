
'use strict';

const STATUS_CODE_REGEX = /^.*\[\d+\].*$/;

function makeMessage( message, detail ) {

    if( detail ) {

        message+= ': ' + detail;
    }

    return message;
}

class VandiumError extends Error {

    constructor( message, detail, cause ) {

        super( makeMessage( message, detail ) );

        this.name = this.constructor.name;

        if( cause ) {

            this.cause = cause;
        }
    }
}

class AuthenticationFailureError extends VandiumError {

    constructor( message ) {

        super( 'authentication error', message );

        this.status = 403;
    }
}

class ValidationError extends VandiumError {

    constructor( cause ) {

        super( 'validation error', (cause ? cause.message : undefined ), cause );

        this.status = 422;
    }
}

class UncaughtError extends VandiumError {

    constructor( cause ) {

        super( 'uncaught error', cause.message, cause );

        this.status = 500;
    }
}

function strip( err, apiGateway ) {

    if( !(err instanceof Error) ) {

        return;
    }

    for( let key of Object.getOwnPropertyNames( err ) ) {

        try {

            switch( key ) {

                case 'name':
                case 'message':
                    break;

                case 'stack':
                    err.stack = '';
                    break;

                default:
                    if( !apiGateway ) {

                        delete err[ key ];
                    }
            }
        }
        catch( e ) {

            // ignore
        }
    }
}

function stringify( error ) {

    let newError = {

        errorType: error.name || 'Error'
    };

    for( let key of Object.getOwnPropertyNames( error ) ) {

        let value = error[ key ];

        switch( key ) {

            case 'message':
                newError.errorMessage = value;
                break;

            case 'stack':
                value = value ? value.toString() : '';
                newError.stackTrace = value.split( '\n    at ' ).splice( 1 );
                break;

            default:
                newError[ key ] = value;
                break;
        }
    }

    if( !newError.errorMessage ) {

        newError.errorMessage = newError.errorType;
    }

    if( newError.statusCode && !newError.status ) {

        newError.status = newError.statusCode;
    }

    if( !newError.status && !STATUS_CODE_REGEX.test( newError.errorMessage ) ) {

        // add generic 500 code
        newError.status = 500;
    }

    return JSON.stringify( newError );
}

module.exports = {

    AuthenticationFailureError,
    ValidationError,
    UncaughtError,

    strip,
    stringify
};
