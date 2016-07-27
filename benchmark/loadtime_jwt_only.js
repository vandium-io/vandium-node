'use strict';

const startTime = Date.now();

const vandium = require( '../lib/index' );

vandium.jwt();

const endTime = Date.now();

console.log( 'jwt only - load time: %dms', (endTime - startTime) );
