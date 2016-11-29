'use strict';

const validationProvider = require( './validation_provider' ).getInstance();

const utils = require( '../../utils' );

const ValidationError = require( '../../errors' ).ValidationError;

const Plugin = require( '../plugin' );

const parser = require( 'joi-json' ).parser( validationProvider.engine );

const HTTP_METHODS = [ 'GET', 'POST', 'PUT', 'POST', 'DELETE', 'HEAD', 'PATCH' ];

function removeReservedKeys( values ) {

    Object.keys( values ).forEach( function( key ) {

        if( (key.charAt( 0 ) === 'V') && (key.indexOf( 'VANDIUM_' ) === 0) ) {

            delete values[ key ];
        }
    });
}

function removeKeys( values, keysToRemove ) {

    if( keysToRemove ) {

        for( let key of keysToRemove ) {

            delete values[ key ];
        }
    }
}

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

function getMethodSchema( value ) {

    let methodSchema = {};

    // headers, body, etc - create schema validators
    for( let section in value ) {

        let sectionSchemaDef = value[ section ];

        methodSchema[ section ] = createSchema( sectionSchemaDef );
    }

    return methodSchema;
}

function buildSchema( schema, lambdaProxy, lambdaProxyAny ) {

    if( lambdaProxy === true ) {

        let proxySchema;

        if( lambdaProxyAny ) {

            proxySchema = {};

            // GET, POST, PUT, DELETE, etc.
            for( let key in schema ) {

                let value = schema[ key ];

                if( utils.isObject( value ) ) {

                    proxySchema[ key ] = getMethodSchema( value );
                }
            }

            for( let key in schema ) {

                let value = schema[ key ];

                if( utils.isString( value ) ) {

                    let schema = proxySchema[ value ];

                    if( !schema ) {

                        throw new Error( 'Invalid schema reference: ' + value + ' for method ' + key );
                    }

                    proxySchema[ key ] = schema;
                }
            }
        }
        else {

            proxySchema = getMethodSchema( schema );
        }

        return proxySchema;
    }
    else {

        return createSchema( schema );
    }
}

class ValidationPlugin extends Plugin {

    constructor() {

        super( 'validation' );

        this.ignoredProperties = [];
        this.options = { allowUnknown: true };
    }

    execute( pipelineEvent, callback ) {

        let schema = this.configuredSchema;

        if( this.lambdaProxy && schema && this.lambdaProxyAny ) {

            schema = this.configuredSchema[ pipelineEvent.event.httpMethod ];
        }

        if( !schema ) {

            // validation not configured - skip
            return callback();
        }

        try {

            // create values object with *only* the values that we want to verify (i.e. hide the noise)
            var values = utils.clone( pipelineEvent.event );

            let updated;

            if( this.lambdaProxy ) {

                updated = {};


                for( let section in schema ) {

                    let sectionValues = values[ section ] || {};

                    updated[ section ] = validationProvider.validate( sectionValues, schema[ section ], this.options );
                }
            }
            else {

                // remove all 'VANDIUM_xxxxxx'
                removeReservedKeys( values );

                // remove ignored from other parts of the validation pipeline
                removeKeys( values, pipelineEvent.ignored );

                // skip ignored values
                removeKeys( values, this.ignoredProperties );

                updated = validationProvider.validate( values, schema, this.options );
            }

            // update values in event with validated ones
            Object.keys( updated ).forEach( function( key ) {

                pipelineEvent.event[ key ] = updated[ key ];
            });

            callback();
        }
        catch( err ) {

            callback( new ValidationError( err ) );
        }
    }

    setSchema( schema, lambdaProxy ) {

        let configuredSchema = null;

        let lambdaProxyAny = false;

        if( lambdaProxy ) {

            for( let key in schema ) {

                if( HTTP_METHODS.indexOf( key ) > -1 ) {

                    lambdaProxyAny = true;
                    break;
                }
            }
        }

        if( schema ) {

            configuredSchema = buildSchema( schema, lambdaProxy, lambdaProxyAny );
        }

        this.configuredSchema = configuredSchema;
        this.lambdaProxy = (lambdaProxy === true);
        this.lambdaProxyAny = lambdaProxyAny;
    }

    configure( config ) {

        config = config || {};

        this.setSchema( config.schema, config.lambdaProxy );

        this.options = { allowUnknown: true };

        this.ignoredProperties = [];

        this.ignore( config.ignore || [] );

        if( config.allowUnknown !== undefined ) {

            this.options.allowUnknown = config.allowUnknown;
        }
    }

    getConfiguration() {

        let config = { };

        if( this.configuredSchema ) {

            config.schema = Object.assign( {}, this.configuredSchema );

            config.ignore = this.ignoredProperties.slice(0);

            config.allowUnknown = this.options.allowUnknown;
        }

        return config;
    }

    ignore() {

        let ignored = new Set( this.ignoredProperties );

        for( var i = 0; i < arguments.length; i++ ) {

            var value = arguments[ i ];

            if( utils.isArray( value ) ) {

                for( let v of value ) {

                    ignored.add( v.toString() );
                }
            }
            else {

                ignored.add( value.toString() );
            }
        }

        this.ignoredProperties = Array.from( ignored );
    }

    get types() {

        return validationProvider.types;
    }

    get validator() {

        return validationProvider.engine;
    }

    get state() {

        let state = {};

        state.enabled = !!this.configuredSchema;

        if( state.enabled ) {

            state.keys = Object.keys( this.configuredSchema );

            state.ignored = this.ignoredProperties.slice(0);
        }

        return state;
    }
}

Object.defineProperty( ValidationPlugin, 'types', {

    get: function() {

        return validationProvider.types;
    }
});

module.exports = ValidationPlugin;
