'use strict';

const handlers = require( './handlers' );

function createHandler( type, handler ) {

    return handlers.create( type, handler, (event) => event.Records );
}

module.exports = createHandler;
