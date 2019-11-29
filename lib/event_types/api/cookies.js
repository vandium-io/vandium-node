const cookie = require( 'cookie' );

const { isObject, map } = require( '../../utils' );

function processCookies( headers ) {

    if( headers && headers.Cookie) {

        try {

            return cookie.parse( headers.Cookie );
        }
        catch( err ) {

            console.log( 'cannot process cookies', err );
        }
    }

    return {};
}

function serializeCookies( setCookie ) {

    return map( setCookie, (responseCookie) => {

        if( isObject( responseCookie ) ) {

            return cookie.serialize( responseCookie.name, responseCookie.value, responseCookie.options );
        }
        else {

            return responseCookie;
        }
    });
}

module.exports = {

    processCookies,
    serializeCookies,
};
