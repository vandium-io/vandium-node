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

module.exports = {

    AuthenticationFailureError,
    ValidationError
};
