'use strict';

function extractConfig( args ) {

    return (args.length === 1 ? {} : args[0] );
}

function extractOptions( args ) {

    return extractConfig( args );
}

function extractHandler( args ) {

    return (args.length === 1 ? args[0] : args[1] );
}

module.exports = {

    extractConfig,
    extractOptions,
    extractHandler
};
