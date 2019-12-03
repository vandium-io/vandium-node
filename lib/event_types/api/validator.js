const validation = require( '../../validation' );

function removeOptionsFromSchema( schema ) {

    if( schema.__allowUnknown !== undefined ) {

        const { __allowUnknown, ...rest } = schema;

        return rest;
    }

    return schema;
}

function expandValidators( options ) {

    let updatedOptions = { ...options };

    if( options.headers && !options.multiValueHeaders ) {

        updatedOptions.multiValueHeaders = validation.createArrayBasedSchema( removeOptionsFromSchema( options.headers ) );
    }

    if( (options.query || options.queryStringParameters) && !options.multiValueQueryStringParameters ) {

        updatedOptions.multiValueQueryStringParameters = validation.createArrayBasedSchema( removeOptionsFromSchema( options.query || options.queryStringParameters ) );
    }

    return updatedOptions;
}

class SectionValidator {

    constructor( key, schema, defaultOptions ) {

        this.key = key;

        let options = {};

        if( schema.__allowUnknown !== undefined ) {

            options.allowUnknown = schema.__allowUnknown;

            delete schema.__allowUnknown;
        }

        this.schema = new validation.createSchema( schema );

        this.options = { ...defaultOptions, ...options };
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

    constructor( { __allowUnknown, ...schemas } ) {

        this.validators = [];

        const defaultOptions = {

            allowUnknown: (__allowUnknown === undefined ? true : __allowUnknown),
        };

        schemas = expandValidators( schemas );

        for( let key in schemas ) {

            let value = schemas[ key ];

            switch( key ) {

                case 'headers':
                case 'queryStringParameters':
                case 'body':
                case 'pathParameters':
                case 'multiValueHeaders':
                case 'multiValueQueryStringParameters':
                    this.validators.push( new SectionValidator( key, value, defaultOptions ) );
                    break;

                case 'query':
                    this.validators.push( new SectionValidator( 'queryStringParameters', value, defaultOptions ) );
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
