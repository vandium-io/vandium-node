'use strict';

var vandium = require( 'vandium' );

// validate that the event contains firstName, lastName and age

vandium.validation( {

    firstName: 'string:min=1,max=250,trim,required',

    lastName: 'string:min=1,max=250,trim,required',

    age: 'number:min=0,max=130,required'
});

// must have jwt

vandium.jwt.configure( {

    algorithm: 'RS256',
    public_key: 'MFswDQYJKoZIhvcNAQEBBQADSgAwRwJAelQWAau/FtrEsLf+wYce8vtZwIunQ93H' +
                '8OVAXY0HifArQdMjEWj1rFZ6+sJqkG+HogtU5rdqFM0DYrS+pPpTeQIDAQAB'
});

exports.handler = vandium( function( event ) {

    // log our event
    console.log( JSON.stringify( event, null, 2 ) );

    return Promise.resolve( {

        first: event.firstName,

        last: event.lastName,

        age: event.age
    });
});
