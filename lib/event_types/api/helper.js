
function processHeaderValue( headers, name, value ) {

    if( name && (value !== undefined && value !== null) ) {

        const existing = headers[ name ];

        const strValue = value.toString();

        if( !existing ) {

            headers[ name ] = strValue;
        }
        else {

            if( !Array.isArray( existing ) ) {

                headers[ name ] = [ existing, strValue ];
            }
            else {

                headers[ name ].push( strValue );
            }
        }
    }
}

module.exports = {

    processHeaderValue,
};
