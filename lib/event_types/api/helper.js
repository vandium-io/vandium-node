const { map } = require( '../../utils' );

function toArray( value ) {

    if( !Array.isArray( value ) ) {

        value = [ value ];
    }

    return value;
}

function processHeaderValue( headers, name, value ) {

    if( name && (value !== undefined && value !== null) ) {

        const existing = headers[ name ];

        value = map( value, (v) => v.toString() );

        if( !existing ) {

            headers[ name ] = value;
        }
        else {

            headers[ name ] = [ ...toArray( existing ), ...toArray( value ) ];
        }
    }
}

module.exports = {

    processHeaderValue,
};
