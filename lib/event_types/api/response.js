const { processHeaderValue } = require( './helper' );

const { isObjectEmpty, isString } = require( '../../utils' );

const { serializeCookies } = require( './cookies' );

function getStatusCode( httpMethod ) {

    switch( httpMethod ) {

        case 'DELETE':
            return 204;

        case 'POST':
            return 201;

        default:
            return 200;
    }
}

function processResponseHeaders( headersToProcess ) {

    let headers = {};
    let multiValueHeaders = {};

    for( let key in headersToProcess ) {

        const value = headersToProcess[ key ];

        if( Array.isArray( value ) ) {

            multiValueHeaders[ key ] = value;
        }
        else {

            headers[ key ] = value;
        }
    }

    let result = { headers };

    if( !isObjectEmpty( multiValueHeaders ) ) {

        result.multiValueHeaders = multiValueHeaders;
    }

    return result;
}

function createProxyObject( body, statusCode, headers, isBase64Encoded = false ) {

    if( body ) {

        if( Buffer.isBuffer( body ) ) {

            body = body.toString( 'base64' );
            isBase64Encoded = true;
        }
        else if( !isString( body ) ) {

            body = JSON.stringify( body );
        }
    }

    let processedHeaders = processResponseHeaders( headers );

    return {

        statusCode,

        ...processedHeaders,

        body,

        isBase64Encoded,
    };
}

function mergeHeaders( ...headersToMerge ) {

    let headers = {};

    headersToMerge.forEach( (headerObject) => {

        if( headerObject ) {

            for( let name in headerObject ) {

                processHeaderValue( headers, name, headerObject[ name ] );
            }
        }
    })

    return headers;
}

function processResult( result, context, additionalHeaders ) {

    let body = result;

    result = result || {};

    if( result.body ) {

        body = result.body;
    }

    let statusCode = result.statusCode || getStatusCode( context.event.httpMethod );
    let headers = mergeHeaders( result.headers, additionalHeaders );

    const { setCookie } = result;

    if( setCookie ) {

        headers[ 'Set-Cookie' ] = serializeCookies( setCookie );
    }

    let isBase64Encoded = result.isBase64Encoded;

    return { result: createProxyObject( body, statusCode, headers, isBase64Encoded === true) };
}

function processError( error, additionalHeaders ) {

    let statusCode = error.status || error.statusCode || 500;
    let headers = mergeHeaders( error.headers, additionalHeaders );

    let body = error.body || {

        type: error.name,
        message: error.message
    };

    return { result: createProxyObject( body, statusCode, headers ) };
}

module.exports = {

    processResult,
    processError,
};
