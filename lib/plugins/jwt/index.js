'use strict';

const utils = require( '../../utils' );

const JWTConfiguration = require( './configuration' );

const validator = require( './validator' );

const Plugin = require( '../plugin' );

function configureFromEnvVars( instance ) {

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

    instance.configure( options );
}

class JWTPlugin extends Plugin {

    constructor() {

        super( 'jwt' );

        this.configuration = new JWTConfiguration();

        configureFromEnvVars( this );
    }

    configure( config ) {

        this.configuration.update( config );
    }

    enable() {

        this.configure( {} );
    }

    isEnabled() {

        return this.configuration.isEnabled();
    }

    execute( pipelineEvent, callback ) {

        try {

            validator.validate( pipelineEvent.event, this.configuration );

            let keysToIgnore = this.configuration.getIgnoredProperties( pipelineEvent.event );

            if( keysToIgnore ) {

                for( let item of keysToIgnore ) {

                    pipelineEvent.ignored.push( item );
                }
            }

            callback();
        }
        catch( err ) {

            callback( err );
        }
    }

    get state() {

        return this.configuration.state;
    }
}


module.exports = JWTPlugin;
