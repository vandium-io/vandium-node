'use strict';

const HEX = 16;

const RANDOM_LENGTH = 24;

const MS_PER_SEC = 1000;

function generateRandomHex( length ) {

    let string = '';

    for( let i = 0; i < length; i++ ) {

        string += Math.floor( Math.random() * HEX ).toString( HEX );
    }

    return string;
}

function createTraceId() {

    let timestamp = Math.round( new Date().getTime() / MS_PER_SEC ).toString( HEX );

    let randomHex = generateRandomHex( RANDOM_LENGTH );

    let id = `1-${timestamp}-${randomHex}`;

    return 'Root=' + id + ';Parent=53995c3f42cd8ad8;Sampled=1';
}

module.exports = createTraceId;
