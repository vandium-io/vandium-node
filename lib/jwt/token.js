const jwt = require( 'jwt-simple' );

const { valueFromPath } = require( '../utils' );

const { AuthenticationFailureError } = require( '../errors' );

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

    const decoded = decodeJWT( token, key, algorithm );

    const { iat } = decoded;

    if( iat ) {

        // put into JWT NumericDate format
        let now = Date.now() / 1000;

        if( iat > now ) {

            throw new AuthenticationFailureError( 'token used before issue date' );
            // not valid yet...
        }
    }

    return decoded;
}

function validateXSRF( decodedToken, xsrfToken, xsrfClaimPath ) {

    if( !xsrfToken ) {

        throw new AuthenticationFailureError( 'missing xsrf token' );
    }

    let xsrf = valueFromPath( decodedToken, xsrfClaimPath );

    if( !xsrf ) {

        throw new AuthenticationFailureError( 'xsrf claim missing' );
    }

    if( xsrf !== xsrfToken ) {

        throw new AuthenticationFailureError( 'xsrf token mismatch' );
    }
}

module.exports = {

    decode,
    validateXSRF
};
