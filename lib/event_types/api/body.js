const { parseJSON, parseQueryString } = require( '../../utils' );

function safeJSONParse( value ) {

    try {

        return  parseJSON( value );
    }
    catch( err ) {

        // ignore
    }
}

function safeFormURLEncodedParse( value ) {

    try {

        return parseQueryString( value );
    }
    catch( err ) {

        // return value;
    }
}

function processBody( value, encoding = 'auto' ) {

    if( encoding === 'auto' ) {

        value = safeJSONParse( value ) || safeFormURLEncodedParse( value ) || value;
    }
    else if( encoding === 'formURLEncoded' ) {

        value = safeFormURLEncodedParse( value ) || value;
    }

    // converted or original value
    return value;
}

module.exports = {

    processBody,
};
