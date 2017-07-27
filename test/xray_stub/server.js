'use strict';

const AWSXRay = require( 'aws-xray-sdk-core' );

const dgram = require( 'dgram' );

const createTraceId = require( './trace_id' );

var server = null;

function processMessage( msg ) {

    try {

        let packet = msg.toString();

        let parts = packet.split( '\n', 2 );

        server._segments.push( JSON.parse( parts[1] ) );
    }
    catch( err ) {

        console.log( 'error while processing message:', err );
    }
}

function createServer( port = 2000 ) {

    return new Promise( (resolve, reject) => {

        try {

            if( server ) {

                throw new Error( 'server already running' );
            }

            server = dgram.createSocket( 'udp4' );

            server._segments =[];

            server.on( 'error', ( err ) => {

                console.log( `server error:\n${err.stack}` );

                server.close();

                server = null;
            });

            server.on( 'message', processMessage );

            server.bind( port, '127.0.0.1', () => {

                process.env.AWS_XRAY_DAEMON_ADDRESS = `127.0.0.1:${port}`;
                process.env._X_AMZN_TRACE_ID = createTraceId();

                AWSXRay.setDaemonAddress( process.env.AWS_XRAY_DAEMON_ADDRESS );

                resolve();
            });
        }
        catch( err ) {

            reject( err );
        }
    });
}



/**
 * @Promise
 */
function start() {

    return createServer();
}

/**
 * @Promise
 */
function stop() {

    return new Promise( (resolve) => {

        if( !server ) {

            resolve();
        }

        server.close( () => {

            server = null;

            resolve();
        });
    });
}

function reset() {

    if( server ) {

        server._segments = [];
    }
}

module.exports = {

    start,
    stop,
    reset,
    get segments() {

        return server._segments;
    }
};
