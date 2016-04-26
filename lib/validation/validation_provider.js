'use strict';

class ValidationProvider {

    constructor( engine, types ) {

        this.engine = engine;

        this.types = types;
    }

    getTypes() {

        return this.types;
    }

    validate( values, options ) {

        var result = this.engine.validate( values, this.schema, options );

        if( result.error ) {

            throw result.error;
        }

        return result.value;
    }

    updateSchema( schema ) {

        this.schema = schema;
    }

    isConfigured() {

        return (this.schema !== undefined);
    }
}

module.exports = ValidationProvider;
