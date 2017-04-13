'use strict';

const jwt = require( 'jwt-simple' );

const AuthenticationFailureError = require( '../errors' ).AuthenticationFailureError;

function decodeJWT( token, key, algorithm ) {

    try {

        return jwt.decode( token, key, false, algorithm );
    }
    catch( err ) {

        throw new AuthenticationFailureError( err.message );
    }
}

function decode( token, algorithm, key ) {

    if( !token ) {

        throw new AuthenticationFailureError( 'missing jwt token' );
    }

    let decoded = decodeJWT( token, key, algorithm );

    if( decoded.iat ) {

        // put into JWT NumericDate format
        let now = Date.now() / 1000;

        if( decoded.iat > now ) {

            throw new AuthenticationFailureError( 'token used before issue date' );
            // not valid yet...
        }
    }

    return decoded;
}

function validateXSRF( decodedToken, xsrfToken, xsrfClaimName ) {

    if( !xsrfToken ) {

        throw new AuthenticationFailureError( 'missing xsrf token' );
    }

    let xsrf = decodedToken[ xsrfClaimName ];

    if( !xsrf ) {

        throw new AuthenticationFailureError( xsrfClaimName + ' claim missing' );
    }

    if( xsrf !== xsrfToken ) {

        throw new AuthenticationFailureError( 'xsrf token mismatch' );
    }
}

module.exports = {

    decode,
    validateXSRF
};
