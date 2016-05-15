'use strict';

// Not enabled in this version but staged for future release

/*
const Lov = require( 'lov' );

const ValidationProvider = require( './validation_provider' );

const TYPES = {

    any: function() {

            return Lov.any();
        },

    array: function() {

            return Lov.array();
        },

    boolean: function() {

            return Lov.boolean();
        },

    binary: function() {

            return Lov.binary();
        },

    date: function() {

            return Lov.date();
        },

    number: function() {

            return Lov.number();
        },

    object: function() {

            return Lov.object();
        },

    string: function( opts ) {

            var stringValidator = Lov.string();

            if( !opts || (opts.trim === undefined) || (opts.trim === true) ) {

                stringValidator = stringValidator.trim();
            }

            return stringValidator;
        },

    uuid: function() {

            return Lov.string().uuid();
        },

    email: function() {

            return Lov.string().email();
        }
};


class LovValidationProvider extends ValidationProvider {

    constructor() {

        super( Lov, TYPES );
    }

    validate( values, options ) {

        let updatedOptions = Object.assign( {}, options );

        updatedOptions.wantResults = true;

        return super.validate( values, updatedOptions );
    }
}

module.exports = new LovValidationProvider();
*/
