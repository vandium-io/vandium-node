'use strict';

var EventEmitter = require( 'events' ).EventEmitter;

var util = require( 'util');

var utils = require( '../utils' );

var logger = require( '../logger' );

// load default
var config = require( '../../config.json' );

var loaded = false;

function ConfigurationEmitter() {

    EventEmitter.call( this );
}

util.inherits( ConfigurationEmitter, EventEmitter );

var configEmitter = new ConfigurationEmitter();

config.wait = function( callback ) {

    if( !loaded ) {

        configEmitter.once( 'complete', callback );
    }
    else {

        callback();
    }
}

config.on = function( event, callback ) {

    configEmitter.on( event, callback );
}

function mergeConfig( updated ) {

    if( updated && utils.isObject( updated ) ) {

        Object.keys( updated ).forEach( function( key ) {

            // filter out reserved words
            if( key !== 'on' && key !== 'wait' ) {

                var val = updated[ key ];

                if( val !== undefined ) {

                    config[ key ] = utils.clone( val );
                }
            }
        });


        configEmitter.emit( 'update' );
    }
}

function completeLoading() {

    loaded = true;

    logger.debug( 'configuration loading complete' );

    configEmitter.emit( 'complete' );
}

function configFromS3( err, loaded ) {

    if( err ) {

        logger.error( 'Error loading from s3: ' + err.message );
    }
    else {

        mergeConfig( loaded );
    }

    completeLoading();
}

function configFromFile( err, loaded ) {

    if( err ) {

        logger.error( 'Error loading config file: %s', err.message );
    }
    else {

        mergeConfig( loaded );

        if( utils.isObject( config.s3 ) && config.s3.bucket && config.s3.key ) {

            return require( './s3' ).load( config.s3, configFromS3 );
        }
    }

    completeLoading();
}

// start by loading config from file
require( './file' ).load( configFromFile );

module.exports = config;
