'use strict';

function parseJSON( content, callback ) {

    if( callback ) {

        try {

            callback( null, JSON.parse( content ) );
        }
        catch( err ) {

            callback( err );
        }
    }
    else {

        return JSON.parse( content );
    }
}

function isPromise( value ) {

    return ((!!value && isFunction( value.then ) && isFunction( value.catch ) ));
}

function isFunction( value ) {

    return (!!value && value.constructor === Function);
}

function isObject( value ) {

    let type = typeof value;

    return !!value && ((type == 'object') || (type == 'function'));
}

function isString( value ) {

    return !!value && ((typeof value === 'string') || (value instanceof String));
}

function clone( value ) {

    return Object.assign( {}, value );
}

module.exports = {

    clone,

    isObject,

    isString,

    isArray: Array.isArray,

    isFunction,

    isPromise,

    parseJSON
};
