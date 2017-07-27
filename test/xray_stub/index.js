'use strict';

// process.env._X_AMZN_TRACE_ID = 'Root=1-5759e988-bd862e3fe1be46a994272793;Parent=53995c3f42cd8ad8;Sampled=1';
//
// process.env.AWS_XRAY_DAEMON_ADDRESS = '127.0.0.1:4000';
//
// const AWSXRay = require( 'aws-xray-sdk-core' );
//
//
// const dgram = require( 'dgram' );
//
// const server = dgram.createSocket( 'udp4' );
//
// const PORT = 2000;
//
// server.on( 'error', ( err ) => {
//
//     console.log( `server error:\n${err.stack}` );
//     server.close();
// });
//
// server.on( 'message', ( msg ) => {
//
//     let packet = msg.toString();
//
//     let parts = packet.split( '\n', 2 );
//
//     console.log( parts[0] );
//     console.log( JSON.parse( parts[1] ) );
// });
//
// server.on( 'listening', () => {
//
//     var address = server.address();
//     console.log( `server listening ${address.address}:${address.port}` );
// });
//
// server.bind( PORT, '127.0.0.1', () => {
//
//     console.log( 'listening!' );
//
//
//     AWSXRay.setDaemonAddress( '127.0.0.1:2000' );
//     //AWSXRay.setStreamingThreshold(10);
// });
//
//
// console.log( 'here' );
//
// module.exports = {
//
//     start() { return Promise.resolve() },
//
//     stop() { return Promise.resolve() }
// }

module.exports = require( './server' );

//module.exports.start();
