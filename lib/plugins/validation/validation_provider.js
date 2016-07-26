'use strict';

var instance;

class ValidationProvider {

    constructor( engine, types ) {

        this.engine = engine;

        this.types = types;
    }

    validate( values, schema, options ) {

        var result = this.engine.validate( values, schema, options );

        if( result.error ) {

            throw result.error;
        }

        return result.value;
    }

    static getInstance() {

        if( !instance ) {

            // future
            // if( process.env.VANDIUM_VALIDATION_PROVIDER !== 'lov' ) {
            //
            //     try {

                    // joi might not be present
                    //require( 'joi' );

                    // joi exists - use it
                    instance = require( './joi_provider' );
            //     }
            //     catch( err ) {
            //
            //     }
            // }
            //
            // // fall back to our joi provider
            // return require( './lov_provider' );
        }

        return instance;
    }
}

module.exports = ValidationProvider;
