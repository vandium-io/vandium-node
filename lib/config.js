const fs = require( 'fs' )

const { isObject } = require( './utils' );

function setEnv( value, envVar ) {

    if( value !== undefined ) {

        if( !process.env[ envVar ] ) {

            process.env[ envVar ] = value.toString();
        }
        else {

            console.error( `${envVar} already set - configuration file value will be ignored` );
        }
    }
}

function loadConfigFile() {

    try {

        return fs.readFileSync( 'vandium.json', { encoding: 'utf8' } );
    }
    catch( err ) {

        // ignore
    }
}

function processConfig( config ) {

    const { jwt, authorization, prevent } = config;

    if( authorization ) {

        setEnv( true, 'VANDIUM_AUTHORIZATION_JWT' );
        setEnv( authorization.algorithm, 'VANDIUM_JWT_ALGORITHM' );
        setEnv( authorization.publicKey, 'VANDIUM_JWT_PUBKEY' );
        setEnv( authorization.secret, 'VANDIUM_JWT_SECRET' );
        setEnv( authorization.key, 'VANDIUM_JWT_KEY' );
        setEnv( authorization.token, 'VANDIUM_JWT_TOKEN_PATH' )

        setEnv( authorization.xsrf, 'VANDIUM_JWT_USE_XSRF' );
        setEnv( authorization.xsrfToken, 'VANDIUM_JWT_XSRF_TOKEN_PATH' );
        setEnv( authorization.xsrfClaim, 'VANDIUM_JWT_XSRF_CLAIM_PATH' );
    }
    else if( jwt ) {

        setEnv( jwt.algorithm, 'VANDIUM_JWT_ALGORITHM' );
        setEnv( jwt.publicKey, 'VANDIUM_JWT_PUBKEY' );
        setEnv( jwt.secret, 'VANDIUM_JWT_SECRET' );
        setEnv( jwt.key, 'VANDIUM_JWT_KEY' );
        setEnv( jwt.token, 'VANDIUM_JWT_TOKEN_PATH' )

        setEnv( jwt.xsrf, 'VANDIUM_JWT_USE_XSRF' );
        setEnv( jwt.xsrfToken, 'VANDIUM_JWT_XSRF_TOKEN_PATH' );
        setEnv( jwt.xsrfClaim, 'VANDIUM_JWT_XSRF_CLAIM_PATH' );
    }

    if( prevent ) {

        setEnv( prevent.eval, 'VANDIUM_PREVENT_EVAL' );
    }
}

function configure() {

    try {

        let contents = loadConfigFile();

        if( !contents ) {

            return {};
        }

        let config = JSON.parse( contents );

        if( !isObject( config ) ) {

            throw new Error( 'not an object' );
        }

        processConfig( config );

        return config;
    }
    catch( err ) {

        console.error( 'error loading configuration file:', err.message );

        return {};
    }
}

module.exports = configure();
