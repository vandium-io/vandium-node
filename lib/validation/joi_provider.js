'use strict';

const Joi = require( 'joi' );

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

            if( schemaKey.isJoi && !schemaKey._flags.label ) {

                schema[ key ] = schemaKey.label( key );
            }
        }

        return schema;
    }

    createArrayBasedSchema( schema ) {

        // do not call base implementation

        let arraySchema = {};

        for( let key in schema ) {

            arraySchema[ key ] = Joi.array().items( schema[ key ] );
        }

        return arraySchema;
    }
}

module.exports = new JoiValidationProvider();
