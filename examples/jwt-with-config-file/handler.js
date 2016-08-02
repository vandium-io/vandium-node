'use strict';

var vandium = require( 'vandium' );

// validate that the event contains firstName, lastName and age

vandium.validation( {

    firstName: vandium.types.string().min( 1 ).max( 250 ).required(),

    lastName: vandium.types.string().min( 1 ).max( 250 ).required(),

    age: vandium.types.number().min( 0 ).max( 130 ).required()
});

// note: jwt is configured in vandium.json file

exports.handler = vandium( function( event, context, callback ) {

    // log our event
    console.log( JSON.stringify( event, null, 2 ) );

    callback( null, 'ok' );
});
