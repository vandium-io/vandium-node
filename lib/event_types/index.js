'use strict';

const basic = require( './basic' );

const cloudwatch = require( './cloudwatch' );

const record = require( './record' );

const { isObject } = require( '../utils' );

const { api, apigateway } = require( './api' );

const generic = require( './custom' );

function getTypes() {

  const asEventInfo = ( obj ) => {

    if( isObject( obj ) ) {

        return obj;
    }

    // assume obj is a string
    return { name: obj, type: obj };
  }

  const eventTypes = {

    // specialized
    api,
    generic,
  };

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

    eventTypes[ name ] = ( ...args ) => record( type, ...args );
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

      eventTypes[ name ] = ( ...args ) => cloudwatch( name, ...args );
    }
    else {

      eventTypes[ name ] = ( ...args ) => basic( type, ...args );
    }
  });

  const handlerTypes = {

    apigateway,
    ...eventTypes,
  };

  return { handlerTypes, eventTypes };
}

module.exports = {

  ...getTypes()
};
