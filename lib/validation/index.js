'use strict';

const validationProvider = resolveProvider();

const utils = require( '../utils' );

const ignoredProperties = require( '../ignored-properties' );

const ValidationError = require( '../errors' ).ValidationError;

const stateRecorder = require( '../state' ).recorder( 'validation' );

var configuredSchema;

function verify( event /*, ignoreKeys*/ ) {

    if( !configuredSchema ) {

        // validation not configured - skip
        return;
    }

    // create values object with *only* the values that we want to verify (i.e. hide the noise)
    var values = utils.clone( event );

    // remove all 'VANDIUM_xxxxxx'
    Object.keys( event ).forEach( function( key ) {

        if( (key.charAt( 0 ) === 'V') && (key.indexOf( 'VANDIUM_' ) === 0) ) {

            delete values[ key ];
        }
    });

    ignoredProperties.list().forEach( function( key ) {

        delete values[ key ];
    });

    try {

        let updated = validationProvider.validate( values, configuredSchema );

        // update values in event with validated ones
        Object.keys( updated ).forEach( function( key ) {

            event[ key ] = updated[ key ];
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

                ignoredProperties.add( v.toString() );
            }
        }
        else {

            ignoredProperties.add( value.toString() );
        }
    }
}

function resolveProvider() {

    // future
    // if( process.env.VANDIUM_VALIDATION_PROVIDER !== 'lov' ) {
    //
    //     try {

            // joi might not be present
            //require( 'joi' );

            // joi exists - use it
            return require( './joi_provider' );
    //     }
    //     catch( err ) {
    //
    //     }
    // }
    //
    // // fall back to our joi provider
    // return require( './lov_provider' );
}

function types() {

    return validationProvider.getTypes();
}

stateRecorder.record( { enabled: false } );

module.exports = {

    verify: verify,

    configure: configure,

    types: types,

    ignore: ignore,

    validator: validationProvider.engine
};
