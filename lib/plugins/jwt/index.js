'use strict';

const config = require( '../../config' );

const stateRecorder = require( '../../state' ).recorder( 'jwt' );

const utils = require( '../../utils' );

const JWTConfiguration = require( './configuration' );

const validator = require( './validator' );

const configuration = new JWTConfiguration();

function updateConfiguration( options ) {

    if( options ) {

        configuration.update( options );

        stateRecorder.record( configuration.state() );
    }
}

function configureFromEnvVars() {

    let options = {};

    options.algorithm = process.env.VANDIUM_JWT_ALGORITHM;
    options.secret = process.env.VANDIUM_JWT_SECRET;
    options.public_key = process.env.VANDIUM_JWT_PUBKEY;
    options.token_name = process.env.VANDIUM_JWT_TOKEN_NAME;

    if( process.env.VANDIUM_JWT_USE_XSRF ) {

        options.xsrf = utils.parseBoolean( process.env.VANDIUM_JWT_USE_XSRF );
    }

    options.xsrf_token_name = process.env.VANDIUM_JWT_XSRF_TOKEN_NAME;
    options.xsrf_claim_name = process.env.VANDIUM_JWT_XSRF_CLAIM_NAME;

    // remove unwanted keys
    for( let key in options ) {

        if( options[ key ] === undefined ) {

            delete options[ key ];
        }
    }

    // configure if we've got something
    if( Object.keys( options ).length > 0 ) {

        updateConfiguration( options );
    }
}

function configure( options ) {

    if( !options ) {

        options = {};
    }

    updateConfiguration( options );
}

function enable() {

    configure();
}

function isEnabled() {

    return configuration.isEnabled();
}

function validate( pipelineEvent ) {

    validator.validate( pipelineEvent.event, configuration );

    let keysToIgnore = configuration.getIgnoredProperties( pipelineEvent.event );

    if( keysToIgnore ) {

        for( let item of keysToIgnore ) {

            pipelineEvent.ignored.push( item );
        }
    }
}

// record initial state
stateRecorder.record( configuration.state() );

// load configuration from environment vars
configureFromEnvVars();

// load default configuration
updateConfiguration( config.jwt );

// update configuration as needed
config.on( 'update', function() {

    updateConfiguration( config.jwt );
});

module.exports = {

    enable,

    isEnabled,

    validate,

    configure
}
