'use strict';

const basic = require( './basic' );

const record = require( './record' );

module.exports = {};

// specialized
module.exports.api = require( './api' );
module.exports.generic = require( './custom' );

// record types
[
    's3',
    'dynamodb',
    'sns',
    'ses',
    'kinesis'

].forEach( ( type ) => {

    module.exports[ type ] = function( ...args ) {

        return record( type, ...args );
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

    module.exports[ type ] = function( ...args ) {

        return basic( type, ...args );
    }
});
