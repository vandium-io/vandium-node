
'use strict';

var util = require( 'util' );

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

module.exports = {

    AuthenticationFailureError: AuthenticationFailureError,
    ValidationError: ValidationError
};
