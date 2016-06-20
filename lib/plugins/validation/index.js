'use strict';

const validationProvider = require( './validation_provider' ).getInstance();

const utils = require( '../../utils' );

const ValidationError = require( '../../errors' ).ValidationError;

const stateRecorder = require( '../../state' ).recorder( 'validation' );

var configuredSchema;

var ignoredProperties = {};

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

function validate( pipelineEvent ) {

    if( !configuredSchema ) {

        // validation not configured - skip
        return;
    }

    // create values object with *only* the values that we want to verify (i.e. hide the noise)
    var values = utils.clone( pipelineEvent.event );

    // remove all 'VANDIUM_xxxxxx'
    removeReservedKeys( values );

    // remove ignored from other parts of the validation pipeline
    removeKeys( values, pipelineEvent.ignored );

    // skip ignored values
    removeKeys( values, Object.keys( ignoredProperties ) );

    try {

        let updated = validationProvider.validate( values, configuredSchema );

        // update values in event with validated ones
        Object.keys( updated ).forEach( function( key ) {

            pipelineEvent.event[ key ] = updated[ key ];
        });
    }
    catch( err ) {

        throw new ValidationError( err );
    }
}

function configure( schema ) {

    if( schema ) {

        configuredSchema = schema;

        let keys = Object.keys( configuredSchema );

        stateRecorder.record( { enabled: true, keys } );
    }
}

function ignore() {

    for( var i = 0; i < arguments.length; i++ ) {

        var value = arguments[ i ];

        if( utils.isArray( value ) ) {

            for( let v of value ) {

                ignoredProperties[ v.toString() ] = true;
            }
        }
        else {

            ignoredProperties[ value.toString() ] = true;
        }
    }
}

function types() {

    return validationProvider.getTypes();
}

stateRecorder.record( { enabled: false } );

module.exports = {

    validate,

    configure,

    types: types,

    ignore,

    validator: validationProvider.engine
};
