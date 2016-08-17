'use strict';

const Vandium = require( './vandium' );

var vandiumInstance;

function get() {

    if( !vandiumInstance ) {

        const config = require( './config' ).create();

        // load configuration from file (and spawn s3 load)
        config.load();

        // create using loaded config or default one
        vandiumInstance = new Vandium( config.get() );

        if( !config.isLoaded() ) {

            config.on( 'update', () => {

                let updatedConfig = Object.assign( vandiumInstance.getConfiguration(), config.get() );

                vandiumInstance.configure( updatedConfig );
            });
        }
    }

    return vandiumInstance;
}


function reset() {

    vandiumInstance = undefined;
}

module.exports = {

    get: get,

    reset
}
