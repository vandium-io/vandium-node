'use strict';

const validation = require( '../../validation' );

class SectionValidator {

    constructor( key, schema ) {

        this.key = key;

        this.schema = new validation.createSchema( schema );

        this.options = { allowUnknown: true };
    }

    validate( event ) {

        let updated;

        try {

            updated = validation.validate( event[ this.key ], this.schema, this.options );
        }
        catch( err ) {

            err.statusCode = 400;
            throw err;
        }

        if( updated ) {

            event[ this.key ] = Object.assign( event[ this.key ], updated );
        }
    }
}

class Validator {

    constructor( options ) {

        this.validators = [];

        for( let key in options ) {

            let value = options[ key ];

            switch( key ) {

                case 'headers':
                case 'queryStringParameters':
                case 'body':
                case 'pathParameters':
                    this.validators.push( new SectionValidator( key, value ) );
                    break;

                case 'query':
                    this.validators.push( new SectionValidator( 'queryStringParameters', value ) );
                    break;
            }
        }
    }

    validate( event ) {

        for( let sectionValidator of this.validators ) {

            sectionValidator.validate( event );
        }
    }
}

module.exports = Validator;
