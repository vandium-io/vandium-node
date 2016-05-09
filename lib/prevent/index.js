'use strict';

function isBlockEnabled( name ) {

    let envVarName = 'VANDIUM_PREVENT_' + name;

    let envVar = process.env[ envVarName ];

    return ( envVar === undefined );
}

[
    [ 'EVAL', './eval' ]
].forEach( function( block ) {

    if( isBlockEnabled( block[0] ) ) {

        require( block[1] );
    }
});
