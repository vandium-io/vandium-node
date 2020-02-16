// load environment variables from SSM (if configured)
require( './env' );

// configure settings
require( './config' );

// enable prevention module
require( './prevent' );

const validation = require( './validation' );

const { eventTypes } = require( './event_types' );

const createHandler = require( './create-handler' );

const { useJwks } = require( './auth' );

const vandium = {

    types: validation.types,
    ...eventTypes,

    useJwks,
    createHandler,
};

module.exports = Object.freeze( vandium );
