const Joi = require( '@hapi/joi' );

const ValidationProvider = require( './validation_provider' );

const TYPES = {

    any: () => {

            return Joi.any();
        },

    array: () => {

            return Joi.array();
        },

    boolean: () => {

            return Joi.boolean();
        },

    binary: () => {

            return Joi.binary().encoding( 'base64' );
        },

    date: () => {

            return Joi.date();
        },

    number: () => {

            return Joi.number();
        },

    object: () => {

            return Joi.object();
        },

    string: ( opts ) => {

            var stringValidator = Joi.string();

            if( !opts || (opts.trim === undefined) || (opts.trim === true) ) {

                stringValidator = stringValidator.trim();
            }

            return stringValidator;
        },

    uuid: () => {

            return Joi.string().uuid();
        },

    email: ( opts ) => {

            return Joi.string().email( opts );
        },

    alternatives: () => {

            return Joi.alternatives();
        }
};

class JoiValidationProvider extends ValidationProvider {

    constructor() {

        super( Joi, TYPES );
    }

    processSchema( schema ) {

        schema = super.processSchema( schema );

        for( let key in schema ) {

            let schemaKey = schema[ key ];

            if( Joi.isSchema( schemaKey ) && !schemaKey._flags.label ) {

                schema[ key ] = schemaKey.label( key );
            }
        }

        return Joi.object( schema );
    }

    validate( values, schema, options ) {

        const result = schema.validate( values, options );

        if( result.error ) {

            throw result.error;
        }

        return result.value;
    }

    createArrayBasedSchema( schema ) {

        // do not call base implementation

        let arraySchema = {};

        for( let [key,value] of schema._ids._byKey ) {

            arraySchema[ key ] = Joi.array().items( value.schema );
        }

        return Joi.object( arraySchema );
    }

    isSchema( schema ) {

        return Joi.isSchema( schema );
    }
}

module.exports = new JoiValidationProvider();
