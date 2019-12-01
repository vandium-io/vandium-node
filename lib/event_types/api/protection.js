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

function addSection( sections, name, options, optionName = name  ) {

    if( isEnabled( options[optionName], true ) ) {

        sections.push( name );
    }
}

class Protection {

    constructor( options = {} ) {

        this.sql = new protect.scanners.SQL( { mode: (options.sql || options.mode || 'report') } );
        this.mongodb = new protect.scanners.MONGODB( { mode: (options.mongodb || options.mode || 'report') } );

        this.sections = [];

        addSection( this.sections, 'queryStringParameters', options );
        addSection( this.sections, 'multiValueQueryStringParameters', options, 'queryStringParameters' );
        addSection( this.sections, 'body', options );
        addSection( this.sections, 'pathParameters', options );
    }

    validate( event ) {

        for( let section of this.sections ) {

            let values = event[ section ];

            if( values ) {

                this.sql.scan( values );
                this.mongodb.scan( values );
            }
        }
    }
}

module.exports = Protection;
