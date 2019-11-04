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

            instance = require( './joi_provider' );
        }

        return instance;
    }
}

module.exports = ValidationProvider;
