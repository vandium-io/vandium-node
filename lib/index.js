// load environment variables from SSM (if configured)
require( './env' );

// configure settings
require( './config' );

// enable prevention module
require( './prevent' );

const validation = require( './validation' );

const eventTypes = require( './event_types' );

const vandium = {

    types: validation.types
};

//////////////////
// event types
// ///////////////
for( let type in eventTypes ) {

    vandium[ type ] = eventTypes[ type ];
}

module.exports = Object.freeze( vandium );
