'use strict';

const EventEmitter = require( 'events' ).EventEmitter;

const fs = require( 'fs' );

const utils = require( '../utils' );

const logger = require( '../logger' );

const DEFAULT_CONFIG_FILE_NAME = 'vandium.json';

class Configuration {

    constructor() {

        this._loaded = true;

        this._emitter = new EventEmitter();

        this.config = {};

        this._loaded = false;
    }

    load( configFilePath ) {

        if( !configFilePath ) {

            configFilePath = process.env.LAMBDA_TASK_ROOT + '/' + DEFAULT_CONFIG_FILE_NAME;
        }

        try {

            let config = JSON.parse( fs.readFileSync( configFilePath ) );

            this.config = {};

            this._merge( config );

            let s3 = config.s3;

            const self = this;

            if( utils.isObject( s3 ) && s3.bucket && s3.key ) {

                return this._loadFromS3( s3.bucket, s3.key )
                    .then( function() {

                        self._loaded = true;
                    });
            }
        }
        catch( err ) {

            logger.debug( 'config file: ' + configFilePath + ' not provided - using default configuration' );
        }

        this._loaded = true;
    }

    get() {

        return this.config;
    }

    isLoaded() {

        return this._loaded;
    }

    on( eventType, callback ) {

        logger.debug( 'registered callback for event:', eventType );

        this._emitter.on( eventType, callback );
    }

    _loadFromS3( bucket, key ) {

        // need to require here to avoid "cost" of requiring AWS (200+ms!)
        const s3Loader = require( './s3' );

        const self = this;

        return s3Loader.load( bucket, key )
            .then( function( config ) {

                self._merge( config );
            })
            .catch( function( err ) {

                logger.error( 'error loading from s3', err );
            });
    }

    _merge( config ) {

        this.config = Object.assign( this.config, config );
        this._emitter.emit( 'update' );
    }
}

function create() {

    return new Configuration();
}

module.exports = {

    create
};
