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
    'kinesis',
    'sqs',
    ['firehose','kinesis-firehose'],
    'cloudfront'

].forEach( ( type ) => {

    if( Array.isArray( type ) ) {

        module.exports[ type[0] ] = function( ...args ) {

            return record( type[1], ...args );
        }
    }
    else {

        module.exports[ type ] = function( ...args ) {

            return record( type, ...args );
        }
    }
});

// simple event
[
    'cloudformation',
    'cloudwatch',
    'cognito',
    'lex',
    'scheduled',
    'config',
    ['iotButton','iot-button']

].forEach( ( type ) => {

    if( Array.isArray( type ) ) {

        module.exports[ type[0] ] = function( ...args ) {

            return basic( type[1], ...args );
        }
    }
    else {

        module.exports[ type ] = function( ...args ) {

            return basic( type, ...args );
        }
    }
});
