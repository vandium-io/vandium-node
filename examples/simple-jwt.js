'use strict';

var vandium = require( 'vandium' );

vandium.validation( {

    firstName: vandium.types.string().min( 1 ).max( 250 ).required(),

    lastName: vandium.types.string().min( 1 ).max( 250 ).required(),

    age: vandium.types.number().min( 0 ).max( 130 ).required()
});

exports.handler = vandium( function( event, context ) {

    console.log( JSON.stringify( event, null, 2 ) );

    context.succeed( 'ok' );
});
