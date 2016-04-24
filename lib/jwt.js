'use strict';

const  jwt = require( 'jwt-simple' );

const AuthenticationFailureError = require( './errors' ).AuthenticationFailureError;

const config = require( './config' );

const logger = require( './logger' ).getLogger( 'lib/jwt' );

const ignoredProperties = require( './ignored-properties' );

var jwtAlgorithm;

var jwtKey;

var jwtTokenName = 'jwt';

var enabled = false;

function isEnabled() {

    return enabled || (jwtAlgorithm && jwtKey);
}

function enable() {

    enabled = true;
}

function configure( options ) {

    enabled = true;

    if( !options ) {

        options = {};
    }

    if( options.algorithm ) {

        let algorithm = options.algorithm;

        switch( algorithm ) {

            case 'HS256':
            case 'HS384':
            case 'HS512':
                jwtAlgorithm = algorithm;
                jwtKey = options.secret;
                break;

            case 'RS256':
                jwtAlgorithm = algorithm;
                jwtKey = options.public_key;
                break;
        }
    }

    if( options.token_name ) {

        updateTokenName( options.token_name );
    }

    logger.debug( 'jwt.configure: algorithm=%s, tokenName=%s', jwtAlgorithm, jwtTokenName );

    return configuration();
}

function configuration() {

    return {

        key: jwtKey,
        algorithm: jwtAlgorithm,
        tokenName: jwtTokenName
    };
}

function getAlgorithm( event ) {

    var algorithm = jwtAlgorithm;

    if( !algorithm && event.VANDIUM_JWT_ALGORITHM ) {

        algorithm = event.VANDIUM_JWT_ALGORITHM;
    }

    if( !algorithm ) {

        throw new AuthenticationFailureError( 'missing algorithm' );
    }

    switch( algorithm ) {

        case 'HS256':
        case 'HS384':
        case 'HS512':
        case 'RS256':
            break;

        default:
            throw new AuthenticationFailureError( 'unsupported jwt algorithm: ' + algorithm );
    }

    return algorithm;
}

function getKey( event, algorithm ) {

    var key = jwtKey;

    if( !key ) {

        if( algorithm === 'RS256' ) {

            if( event.VANDIUM_JWT_PUBKEY ) {

                key = event.VANDIUM_JWT_PUBKEY;
            }
        }
        else if( event.VANDIUM_JWT_SECRET ) {

            key = event.VANDIUM_JWT_SECRET;
        }

        if( !key ) {

            throw new AuthenticationFailureError( 'missing validation key' );
        }
    }

    return key;
}

function getTokenName( event ) {

    var name = jwtTokenName;

    if( event.VANDIUM_JWT_TOKEN_NAME ) {

        name = event.VANDIUM_JWT_TOKEN_NAME;

        ignoredProperties.update( jwtTokenName, name );
    }

    return name;
}

function validate( event ) {

    if( !enabled ) {

        // not enabled
        return;
    }

    var tokenName = getTokenName( event );

    var token = event[ tokenName ];

    if( !token ) {

        throw new AuthenticationFailureError( 'missing jwt token' );
    }

    var algorithm = getAlgorithm( event );

    var key = getKey( event, algorithm );

    var decoded = decode( token, key, algorithm );

    if( decoded.iat ) {

        // put into JWT NumericDate format
        var now = Date.now() / 1000;

        if( decoded.iat > now ) {

            throw new AuthenticationFailureError( 'token used before issue date' );
            // not valid yet
        }
    }

    event[ tokenName ] = {

        token: token,

        claims: decoded,
    }
}

function decode( token, key, algorithm ) {

    try {

        return jwt.decode( token, key, false, algorithm );
    }
    catch( err ) {

        throw new AuthenticationFailureError( err.message );
    }
}

function updateTokenName( tokenName ) {

    if( tokenName ) {

        ignoredProperties.update( jwtTokenName, tokenName );

        jwtTokenName = tokenName;
    }
}

function updateConfiguration() {

    if( config.jwt ) {

        logger.debug( 'configuration changed - detecting changes to jwt' );

        configure( config.jwt );
    }
}

function configureFromEnvVars() {

    if( process.env.VANDIUM_JWT_ALGORITHM ) {

        jwtAlgorithm = process.env.VANDIUM_JWT_ALGORITHM;

        if( jwtAlgorithm === 'RS256' ) {

            jwtKey = process.env.VANDIUM_JWT_PUBKEY;
        }
        else {

            jwtKey = process.env.VANDIUM_JWT_SECRET;
        }

        enabled = true;
    }

    if( process.env.VANDIUM_JWT_TOKEN_NAME ) {

        updateTokenName( process.env.VANDIUM_JWT_TOKEN_NAME );

        enabled = true;
    }
}


// add default value for token name
ignoredProperties.add( jwtTokenName );

// load configuration from environment vars
configureFromEnvVars();

// load default configuration
updateConfiguration();

// update configuration as needed
config.on( 'update', updateConfiguration );

module.exports = {

    enable,

    isEnabled,

    validate,

    configuration,

    configure
};
