'use strict';

class ValidationProvider {

    constructor( engine, types ) {

        this.engine = engine;

        this.types = types;
    }

    getTypes() {

        return this.types;
    }

    validate( values, schema, options ) {

        var result = this.engine.validate( values, schema, options );

        if( result.error ) {

            throw result.error;
        }

        return result.value;
    }
}

module.exports = ValidationProvider;
