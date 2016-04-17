'use strict';

const EventEmitter = require( 'events' ).EventEmitter;

const _ = require( 'lodash' );

const util = require( 'util');

const utils = require( '../utils' );

const logger = require( '../logger' );


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

        logger.debug( 'waiting for complete...' );

        configEmitter.once( 'complete', callback );
    }
    else {

        logger.debug( 'complete already fired' );

        callback();
    }
}

config.on = function( event, callback ) {

    logger.debug( 'registered callback for event:', event );

    configEmitter.on( event, callback );
}

function mergeConfig( updated ) {

    Object.keys( updated ).forEach( function( key ) {

        // filter out reserved words
        if( key !== 'on' && key !== 'wait' ) {

            var val = updated[ key ];

            config[ key ] = utils.clone( val );
        }
    });

    configEmitter.emit( 'update' );
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

function updateEnvVars() {

    if( _.isObject( config.env ) ) {

        var env = config.env;

        Object.keys( env ).forEach( function( envVar ) {

            // only set if not already set!
            if( !process.env[ envVar ] ) {

                let value = env[ envVar ];

                if( value ) {

                    process.env[ envVar ] = value.toString();
                }
            }
        });
    }
}

function configFromFile( err, loaded ) {

    loaded = loaded || {};

    mergeConfig( loaded );

    updateEnvVars();

    if( utils.isObject( config.s3 ) && config.s3.bucket && config.s3.key ) {

        return require( './s3' ).load( config.s3, configFromS3 );
    }

    process.nextTick( function() {

        completeLoading();
    });
}

// start by loading config from file
require( './file' ).load( configFromFile );

module.exports = config;
