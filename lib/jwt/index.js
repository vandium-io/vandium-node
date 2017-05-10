'use strict';

const utils = require( './utils' );

const token = require( './token' );

module.exports = {

    decode: token.decode,

    validateXSRF: token.validateXSRF,

    resolveAlgorithm: utils.resolveAlgorithm,

    formatPublicKey: utils.formatPublicKey
};
