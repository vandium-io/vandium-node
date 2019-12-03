module.exports = class ValidationProvider {

    constructor( engine, types ) {

        this.engine = engine;

        this.types = types;
    }

    processSchema( schema ) {

        return schema;
    }

    validate( /*values, schema, options*/ ) {

        throw new Error( 'not implemented' );
    }

    createArrayBasedSchema( /*schema*/ ) {

        throw new Error( 'not implemented' );
    }

    isSchema( /*schema*/ ) {

        throw new Error( 'not implemented' );
    }

    static getInstance() {

        return instance;
    }
}

const instance = require( './joi_provider' );
