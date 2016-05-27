'use strict';

const state = require( '../state' );

function isBlockEnabled( name ) {

    let envVarName = 'VANDIUM_PREVENT_' + name;

    let envVar = process.env[ envVarName ];

    return ( envVar === undefined );
}

function enable() {

    let preventState = {};

    [
        [ 'EVAL', './eval' ]
    ].forEach( function( block ) {

        let enabled = isBlockEnabled( block[0] );

        if( enabled ) {

            require( block[1] );
        }

        preventState[ block[0].toLowerCase() ] = enabled;
    });

    state.record( 'prevent', preventState );
}

enable();

module.exports = {};
