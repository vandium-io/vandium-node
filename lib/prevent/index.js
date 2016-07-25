'use strict';

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

    return preventState;
}

const state = enable();

module.exports = {

    state
};
