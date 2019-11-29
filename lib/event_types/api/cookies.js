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

function serializeCookies( cookies ) {

    return map( cookies, (c) => {

        if( isObject( c ) ) {

            return cookie.serialize( c.name, c.value, c.options );
        }
        else {

            return c;
        }
    });
}

module.exports = {

    processCookies,
    serializeCookies,
};
