const validationProvider = require( './validation_provider' ).getInstance();

const { isObject, isString, map } = require( '../utils' );

const parser = require( 'joi-json' ).parser( validationProvider.engine );

function createSchema( schema ) {

    let updatedSchema = {};

    for( let key in schema ) {

        updatedSchema[ key ] = map( schema[ key ], (value) => {

            if( isString( value ) ) {

                return parser.parse( value );
            }
            else if( isObject( value ) && value.isJoi ) {

                return value;
            }
            else {

                throw new Error( 'invalid schema element at: ' + key );
            }
        });
    }

    return validationProvider.processSchema( updatedSchema );
}

module.exports = {

    createSchema,

    types: validationProvider.types,

    validate( values, schema, options ) {

        return validationProvider.validate( values, schema, options );
    },

    createArrayBasedSchema( schema ) {

        return validationProvider.createArrayBasedSchema( schema );
    }
};
