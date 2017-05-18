'use strict';

const Joi = require( 'joi' );

const ValidationProvider = require( './validation_provider' );

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const TYPES = {

    any: function() {

            return Joi.any();
        },

    array: function() {

            return Joi.array();
        },

    boolean: function() {

            return Joi.boolean();
        },

    binary: function() {

            return Joi.binary().encoding( 'base64' );
        },

    date: function() {

            return Joi.date();
        },

    number: function() {

            return Joi.number();
        },

    object: function() {

            return Joi.object();
        },

    string: function( opts ) {

            var stringValidator = Joi.string();

            if( !opts || (opts.trim === undefined) || (opts.trim === true) ) {

                stringValidator = stringValidator.trim();
            }

            return stringValidator;
        },

    uuid: function() {

            return Joi.string().regex( UUID_REGEX, 'UUID' );
        },

    email: function( opts ) {

            return Joi.string().email( opts );
        },

    alternatives: function() {

            return Joi.alternatives();
        }
};

class JoiValidationProvider extends ValidationProvider {

    constructor() {

        super( Joi, TYPES );
    }
}

module.exports = new JoiValidationProvider();
