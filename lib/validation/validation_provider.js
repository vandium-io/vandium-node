'use strict';

module.exports = class ValidationProvider {

    constructor( engine, types ) {

        this.engine = engine;

        this.types = types;
    }

    processSchema( schema ) {

        return schema;
    }

    validate( values, schema, options ) {

        const result = this.engine.validate( values, schema, options );

        if( result.error ) {

            throw result.error;
        }

        return result.value;
    }

    createArrayBasedSchema( schema ) {

        throw new Error( 'not implemented' );
    }

    static getInstance() {

        return instance;
    }
}

const instance = require( './joi_provider' );
