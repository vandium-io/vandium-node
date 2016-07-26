'use strict';

class Plugin {

    constructor( name ) {

        this.name = name;
    }

    execute( event, callback ) {

        // short circuit
        callback();
    }

    configure( config ) {


    }
}

module.exports = Plugin;
