'use strict';

class Plugin {

    constructor( name ) {

        this.name = name;
    }

    execute( event, callback ) {

        callback( new Error( 'not implemented' ) );
    }

    configure( config ) {


    }
}

module.exports = Plugin;
