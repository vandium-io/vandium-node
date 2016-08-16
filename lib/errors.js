
'use strict';

const util = require( 'util' );

function AuthenticationFailureError( message ) {

    Error.call( this );
    Error.captureStackTrace( this, this.constructor );

    this.message = 'authentication error';

    if( message ) {

        this.message+= ': ' + message;
    }
}

util.inherits( AuthenticationFailureError, Error );

function ValidationError( cause ) {

    Error.call( this );
    Error.captureStackTrace( this, this.constructor );

    this.message = 'validation error';

    if( cause ) {

        this.cause = cause;

        if( cause.message ) {

            this.message+= ': ' + cause.message;
        }
    }
}

util.inherits( ValidationError, Error );

function strip( err ) {

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
                    delete err[ key ];
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

    return JSON.stringify( newError );
}

module.exports = {

    AuthenticationFailureError,
    ValidationError,

    strip,
    stringify
};
