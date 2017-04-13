'use strict';

const AuthenticationFailureError = require( '../errors' ).AuthenticationFailureError;

function resolveAlgorithm( algorithm ) {

    if( !algorithm ) {

        throw new AuthenticationFailureError( 'missing algorithm' );
    }

    switch( algorithm ) {

        case 'HS256':
        case 'HS384':
        case 'HS512':
        case 'RS256':
            break;

        default:
            throw new AuthenticationFailureError( `jwt algorithm "${algorithm}" is unsupported` );
    }

    return algorithm;
}


module.exports = {

    resolveAlgorithm
};
