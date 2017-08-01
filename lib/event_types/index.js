'use strict';

const basic = require( './basic' );

const helper = require( './helper' );

module.exports = {};

// specialized
module.exports.api = require( './api' );
module.exports.generic = require( './custom' );

// types
[
    's3',
    'sns',
    'scheduled',
    'dynamodb',
    'kinesis',
    'ses'

].forEach( (type) => {

    let HandlerType = require( `./${type}` );

    module.exports[ type ] = function( ...args ) {

        return new HandlerType( helper.extractConfig( args ), helper.extractHandler( args ) ).createLambda();
    }
});

// simple event
[
    'cloudformation',
    'cloudwatch',
    'cognito',
    'lex'

].forEach( ( type ) => {

    module.exports[ type ] = function( ...args ) {

        return basic( type, ...args );
    }
});
