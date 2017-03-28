'use strict';

const validationProvider = require( './validation_provider' ).getInstance();

const utils = require( '../utils' );

const parser = require( 'joi-json' ).parser( validationProvider.engine );

function createSchema( schema ) {

    let updatedSchema = {};

    for( let key in schema ) {

        let value = schema[ key ];

        if( utils.isString( value ) ) {

            value = parser.parse( value );
        }
        else if( utils.isObject( value ) ) {

            if( !value.isJoi ) {

                // using Joi-JSON object notation
                value = parser.parse( value );
            }
        }
        else {

            throw new Error( 'invalid schema element at: ' + key );
        }

        updatedSchema[ key ] = value;
    }

    return updatedSchema;
}

module.exports = {

    createSchema,

    types: validationProvider.types,

    engine: validationProvider.engine,

    validate( values, schema, options ) {

        return validationProvider.validate( values, schema, options );
    }
};
