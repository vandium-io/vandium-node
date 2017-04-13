'use strict';

const JWTConfiguration = require( './configuration' );

const Validator = require( './validator' );

const Plugin = require( '../plugin' );

class JWTPlugin extends Plugin {

    constructor() {

        super( 'jwt' );

        let configuration = new JWTConfiguration();
        configuration.updateFromEnvVars();

        this.validator = new Validator( configuration );
    }

    configure( config ) {

        this.validator.configuration.update( config );
    }

    getConfiguration() {

        return this.validator.configuration.get();
    }

    isEnabled() {

        return this.validator.configuration.isEnabled();
    }

    execute( pipelineEvent, callback ) {

        try {

            this.validator.validate( pipelineEvent.event );

            let keysToIgnore = this.validator.configuration.getIgnoredProperties( pipelineEvent.event );

            for( let item of keysToIgnore ) {

                pipelineEvent.ignored.push( item );
            }

            callback();
        }
        catch( err ) {

            callback( err );
        }
    }

    get state() {

        return this.validator.configuration.state;
    }
}


module.exports = JWTPlugin;
