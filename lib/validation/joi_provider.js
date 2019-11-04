'use strict';

const Joi = require( 'joi' );

const ValidationProvider = require( './validation_provider' );

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

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

            return Joi.string().regex( UUID_REGEX, 'UUID' );
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
}

module.exports = new JoiValidationProvider();
