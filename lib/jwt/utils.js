'use strict';

const { AuthenticationFailureError } = require( '../errors' );

const BEGIN_CERT = '-----BEGIN CERTIFICATE-----\n';

const END_CERT = '-----END CERTIFICATE-----\n';

function resolveAlgorithm( algorithm ) {

    switch( algorithm ) {

        case null:
        case undefined:
            throw new AuthenticationFailureError( 'missing algorithm' );

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

function removePublicKeyArmor( key ) {

    let rawKey = '';

    let parts = key.split( '\n' );

    for( let part of parts ) {

        part = part.trim();

        if( !part.startsWith( '---' ) ) {

            rawKey+= part;
        }
    }

    return rawKey;
}

function addPublicKeyArmor( key ) {

    let formattedKey = BEGIN_CERT;

    while( key.length > 0 ) {

        formattedKey+= key.substr( 0, 64 ) + '\n';

        key = key.substr( 64, key.length );
    }

    formattedKey+= END_CERT;

    return formattedKey;
}

function formatPublicKey( key ) {

    // strip any armor
    key = removePublicKeyArmor( key );

    // add correct armor back
    return addPublicKeyArmor( key );
}

module.exports = {

    resolveAlgorithm,

    formatPublicKey
};
