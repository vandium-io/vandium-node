'use strict';

class SectionValidator {

    constructor( key, schema ) {

        this.key = key;
        this.schema = schema;
    }

    validate() {

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
