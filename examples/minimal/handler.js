'use strict';

var vandium = require( 'vandium' );

// no validation or jwt

// just protect our handler

exports.handler = vandium( function( event, context, callback ) {

    // log our event
    console.log( JSON.stringify( event, null, 2 ) );

    callback( null, 'ok' );
});
