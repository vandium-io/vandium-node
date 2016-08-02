'use strict';

var vandium = require( 'vandium' );

// validate that the event contains firstName, lastName and age

vandium.validation( {

    firstName: vandium.types.string().min( 1 ).max( 250 ).required(),

    lastName: vandium.types.string().min( 1 ).max( 250 ).required(),

    age: vandium.types.number().min( 0 ).max( 130 ).required()
});

// must have jwt
//
vandium.jwt.configure( {

    algorithm: 'RS256',
    public_key: 'MFswDQYJKoZIhvcNAQEBBQADSgAwRwJAelQWAau/FtrEsLf+wYce8vtZwIunQ93H' +
                '8OVAXY0HifArQdMjEWj1rFZ6+sJqkG+HogtU5rdqFM0DYrS+pPpTeQIDAQAB'
});

exports.handler = vandium( function( event, context, callback ) {

    // log our event
    console.log( JSON.stringify( event, null, 2 ) );

    callback( null, 'ok' );
});
