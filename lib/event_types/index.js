'use strict';

const basic = require( './basic' );

const cloudwatch = require( './cloudwatch' );

const record = require( './record' );

const { isObject } = require( '../utils' );

module.exports = {};

// specialized
module.exports.api = require( './api' );
module.exports.generic = require( './custom' );

function asEventInfo( obj ) {

    if( isObject( obj ) ) {

        return obj;
    }

    // assume obj is a string
    return { name: obj, type: obj };
}

// record types
[
    's3',
    'dynamodb',
    'sns',
    'ses',
    'kinesis',
    'sqs',
    { name: 'firehose', type: 'kinesis-firehose' },
    'cloudfront'

].forEach( ( obj ) => {

    const { name, type } = asEventInfo( obj );

    module.exports[ name ] = ( ...args ) => record( type, ...args );
});

// simple event
[
    'cloudformation',
    { name: 'logs', type: 'cloudwatch' },
    'cognito',
    'lex',
    'config',
    { name: 'scheduled', type: 'cloudwatch' },
    { name: 'iotButton', type: 'iot-button' },

].forEach( ( obj ) => {

    const { name, type } = asEventInfo( obj );

    if( type === 'cloudwatch' ) {

        module.exports[ name ] = ( ...args ) => cloudwatch( name, ...args );
    }
    else {

        module.exports[ name ] = ( ...args ) => basic( type, ...args );
    }
});
