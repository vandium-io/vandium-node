const fs = require( 'fs' )

const { isObject } = require( './utils' );

function setEnv( value, envVar ) {

    if( value !== undefined ) {

        if( !process.env[ envVar ] ) {

            process.env[ envVar ] = value.toString();
        }
        else {

            console.info( `${envVar} already set - configuration file value will be ignored` );
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

    const { jwt, prevent } = config;

    if( jwt ) {

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
