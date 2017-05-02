'use strict';

const validationProvider = require( './validation_provider' ).getInstance();

const utils = require( '../utils' );

const parser = require( 'joi-json' ).parser( validationProvider.engine );

function createSchema( schema ) {

    let updatedSchema = {};

    for( let key in schema ) {

        let value = schema[ key ];

        if( utils.isString( value ) ) {

            updatedSchema[ key ] = parser.parse( value );
        }
        else if( utils.isObject( value ) && value.isJoi ) {

            updatedSchema[ key ] = value;
        }
        else {

            throw new Error( 'invalid schema element at: ' + key );
        }
    }

    return updatedSchema;
}

module.exports = {

    createSchema,

    types: validationProvider.types,

    validate( values, schema, options ) {

        return validationProvider.validate( values, schema, options );
    }
};
