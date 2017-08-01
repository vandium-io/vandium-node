'use strict';

const TypedHandler = require( './typed' );

class ScheduledHandler extends TypedHandler {

    constructor( config, handlerFunc ) {

        super( 'scheduled', config, handlerFunc );

        this._configuration.schedule = [];
    }

    schedule( s ) {

        this._configuration.schedule.push( s );

        return this;
    }

    rate( r ) {

        return this.schedule( { rate: r } );
    }
}

module.exports = ScheduledHandler;
