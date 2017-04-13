'use strict';

const utils = require( './utils' );

const jwt = require( './jwt' );

module.exports = {

    decode: jwt.decode,

    validateXSRF: jwt.validateXSRF,

    resolveAlgorithm: utils.resolveAlgorithm
};
