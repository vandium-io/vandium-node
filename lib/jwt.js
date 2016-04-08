'use strict';

const  jwt = require( 'jwt-simple' );

const AuthenticationFailureError = require( './errors' ).AuthenticationFailureError;

const config = require( './config' );

const logger = require( './logger' ).getLogger( 'lib/jwt' );

const ignoredProperties = require( './ignored-properties' );

var jwtAlgorithm;

var jwtKey;

var jwtTokenName = 'jwt';

var useStageVars = true;

function configure( options ) {

    if( !options ) {

        options = { useStageVars: true };
    }

    useStageVars = ( options.useStageVars === true );

    var algorithm = options.algorithm || process.env.VANDIUM_JWT_ALGORITHM;

    if( !useStageVars && !algorithm ) {

        algorithm = 'HS256';
    }

    var key;

    if( algorithm === 'RS256' ) {

        key = options.public_key || process.env.VANDIUM_JWT_PUBKEY;

        if( !key && !useStageVars ) {

            throw new Error( 'missing "public_key" option' );
        }
    }
    else {

        switch( algorithm ) {

            case 'HS256':
            case 'HS384':
            case 'HS512':

                key = options.secret || process.env.VANDIUM_JWT_SECRET;

                if( !key && !useStageVars ) {

                    throw new Error( 'missing "secret" option' );
                }

                break;

            default:

                if( !useStageVars ) {

                    throw new Error( 'unsupported algorithm type: ' + algorithm );
                }
        }
    }

    jwtKey = key;
    jwtAlgorithm = algorithm;

    updateTokenName( options.token_name || process.env.VANDIUM_JWT_TOKEN_NAME || jwtTokenName );

    logger.info( 'jwt.configure: algorithm=%s, useStageVars=%s, tokenName=%s', jwtAlgorithm, useStageVars, jwtTokenName );

    return configuration();
}

function configuration() {

    return {

        key: jwtKey,
        algorithm: jwtAlgorithm,
        tokenName: jwtTokenName,
        stageVars: useStageVars
    };
}

function getAlgorithm( event ) {

    var algorithm = jwtAlgorithm;

    if( useStageVars && event.VANDIUM_JWT_ALGORITHM ) {

        algorithm = event.VANDIUM_JWT_ALGORITHM;

        switch( algorithm ) {

            case 'HS256':
            case 'HS384':
            case 'HS512':
            case 'RS256':
                break;

            default:
                throw new Error( 'unsupported jwt algorithm: ' + algorithm );
        }
    }

    if( !algorithm ) {

        throw new AuthenticationFailureError( 'missing algorithm' );
    }

    return algorithm;
}

function getKey( event, algorithm ) {

    var key = jwtKey;

    if( useStageVars ) {

        if( algorithm === 'RS256' ) {

            if( event.VANDIUM_JWT_PUBKEY ) {

                key = event.VANDIUM_JWT_PUBKEY;
            }
        }
        else if( event.VANDIUM_JWT_SECRET ) {

            key = event.VANDIUM_JWT_SECRET;
        }
    }

    if( !key ) {

        throw new AuthenticationFailureError( 'missing validation key' );
    }

    return key;
}

function getTokenName( event ) {

    var name = jwtTokenName;

    if( useStageVars && event.VANDIUM_JWT_TOKEN_NAME ) {

        name = event.VANDIUM_JWT_TOKEN_NAME;
    }

    return name;
}

function validate( event ) {

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

        if( config.jwt.algorithm ) {

            jwtAlgorithm = config.jwt.algorithm;

            logger.debug( 'jwt algorithm updated:', jwtAlgorithm );
        }

        if( jwtAlgorithm === 'RS256' ) {

            jwtKey = config.jwt.public_key;

            logger.debug( 'jwt key updated - using public key' );
        }
        else {

            jwtKey = config.jwt.secret;

            logger.debug( 'jwt key updated - using secret' );
        }

        useStageVars = (config.jwt.use_stage_vars === true );

        logger.debug( 'jwt.use_stage_vars', useStageVars );

        updateTokenName( config.jwt.token_name );

        logger.debug( 'jwt token name', jwtTokenName );
    }
}

// add default value for token name
ignoredProperties.add( jwtTokenName );

// load default configuration
updateConfiguration();

// update configuration as needed
config.on( 'update', updateConfiguration );

module.exports = {

    validate: validate,

    configuration: configuration,

    configure: configure
};
