'use strict';

const protect = require( '../../protect' );

function isEnabled( value, defaultValue ) {

    if( value === undefined ) {

        return defaultValue;
    }
    else if( value === false ) {

        return false;
    }
    else {

        return defaultValue;
    }
}

function addSection( sections, name, options, defaultValue = true ) {

    if( isEnabled( options[name], defaultValue ) ) {

        sections.push( name );
    }
}

class Protection {

    constructor( options = {} ) {

        this.sql = new protect.scanners.SQL( { mode: (options.sql || options.mode || 'report') } );

        this.sections = [];

        addSection( this.sections, 'queryStringParameters', options );
        addSection( this.sections, 'body', options );
        addSection( this.sections, 'pathParameters', options );
    }

    validate( event ) {

        for( let section of this.sections ) {

            let values = event[ section ];

            if( values ) {

                this.sql.scan( values );
            }
        }
    }
}

module.exports = Protection;
