'use strict';

const jwt = require( '../../jwt' );

class JWTValidator {

    constructor( options ) {

        let configuration = new jwt.Configuration();
        configuration.updateFromEnvVars();

        if( options ) {

            configuration.update( options );
        }

        this.validator = new jwt.Validator( configuration );
    }

    validate( event ) {

        this.validator.validate( event.headers );
    }
}

module.exports = JWTValidator;
