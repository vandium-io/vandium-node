'use strict';

const jwt = require( '../../jwt' );

class Validator {

    constructor( configuration ) {

        this.configuration = configuration;
    }

    validate( eventSection ) {

        if( !this.configuration.isEnabled() ) {

            // nothing to do
            return;
        }

        let configValues = this.configuration.resolve( eventSection );

        let tokenName = configValues.tokenName;

        let token = configValues.token;

        let decoded = jwt.decode( token, configValues.algorithm, configValues.key );

        if( configValues.xsrf ) {

            let xsrfToken = eventSection[ configValues.xsrfTokenName ];

            jwt.validateXSRF( decoded, xsrfToken, configValues.xsrfClaimName );
        }

        eventSection[ tokenName ] = {

            token: token,

            claims: decoded,
        }
    }
}

module.exports = Validator;
