'use strict';

const handlers = require( './handlers' );

function recordExtractor( event ) {

    return event.Records;
}

module.exports = {};

// specialized
module.exports.api = require( './api' );

// record types
[
    's3',
    'dynamodb',
    'sns',
    'ses',
    'kinesis'

].forEach( ( type ) => {

    module.exports[ type ] = function( handler ) {

        return handlers.create( type, handler, recordExtractor );
    }
});

// simple event
[
    'cloudformation',
    'cloudwatch',
    'cognito',
    'lex',
    'scheduled'

].forEach( ( type ) => {

    module.exports[ type ] = function( handler ) {

        return handlers.create( type, handler );
    }
});
