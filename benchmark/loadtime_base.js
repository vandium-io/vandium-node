'use strict';

const startTime = Date.now();

// vandium
require( '../index' );

const endTime = Date.now();

console.log( 'base implementation - load time: %dms', (endTime - startTime) );
