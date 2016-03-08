'use strict';

var _ = require( 'lodash' );

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

module.exports = {

    clone: _.clone,
    
    isObject: _.isObject,

    isArray: _.isArray,
    
    parseJSON: parseJSON
};
