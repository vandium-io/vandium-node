'use strict';

const XRayRecorder = require( './xray_recorder' );

const Recorder = require( './recorder' );

function isXRayEnabled() {

    if( process.env.AWS_XRAY_DAEMON_ADDRESS && process.env._X_AMZN_TRACE_ID ) {

        return true;
    }

    return false;
}

function createRecorder() {

    if( isXRayEnabled() ) {

        return new XRayRecorder();
    }

    // do nothing recorder
    return new Recorder();
}

module.exports = {

    createRecorder
};
