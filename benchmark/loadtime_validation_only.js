'use strict';

const startTime = Date.now();

const vandium = require( '../lib/index' );
vandium.validation( {

    id: vandium.types.uuid().required()
});

const endTime = Date.now();

console.log( 'validation only - load time: %dms', (endTime - startTime) );
