'use strict';

const startTime = Date.now();

const vandium = require( '../lib/index' );

vandium.validation( {

    id: vandium.types.uuid().required()
});

vandium.jwt();

const endTime = Date.now();

console.log( 'validation and jwt - load time: %dms', (endTime - startTime) );
