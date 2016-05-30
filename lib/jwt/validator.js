'use strict';

const jwt = require( 'jwt-simple' );

const AuthenticationFailureError = require( '../errors' ).AuthenticationFailureError;

function decode( token, key, algorithm ) {

    try {

        return jwt.decode( token, key, false, algorithm );
    }
    catch( err ) {

        throw new AuthenticationFailureError( err.message );
    }
}

function validate( event, configuration ) {

    if( !configuration.isEnabled() ) {

        // nothing to do
        return;
    }

    let configValues = configuration.resolve( event );

    let tokenName = configValues.tokenName;

    let token = event[ tokenName ];

    if( !token ) {

        throw new AuthenticationFailureError( 'missing jwt token' );
    }

    let xsrfToken;

    if( configValues.xsrf ) {

        xsrfToken = event[ configValues.xsrfTokenName ];

        if( !xsrfToken ) {

            throw new AuthenticationFailureError( 'missing xsrf token' );
        }
    }

    let decoded = decode( token, configValues.key, configValues.algorithm );

    if( decoded.iat ) {

        // put into JWT NumericDate format
        let now = Date.now() / 1000;

        if( decoded.iat > now ) {

            throw new AuthenticationFailureError( 'token used before issue date' );
            // not valid yet...
        }
    }

    if( xsrfToken ) {

        let xsrfClaimName = configValues.xsrfClaimName;

        let xsrf = decoded[ xsrfClaimName ];

        if( !xsrf ) {

            throw new AuthenticationFailureError( xsrfClaimName + ' claim missing' );
        }

        if( xsrf !== xsrfToken ) {

            throw new AuthenticationFailureError( 'xsrf token mismatch' );
        }
    }

    event[ tokenName ] = {

        token: token,

        claims: decoded,
    }
}

module.exports = {

    validate
};
