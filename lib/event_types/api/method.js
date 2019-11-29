'use strict';

const Validator = require( './validator' );

const executors = require( '../executors' );

function extractOptions( args ) {

    return (args.length === 1 ? {} : args[0] );
}

function extractHandler( args ) {

    return (args.length === 1 ? args[0] : args[1] );
}

class MethodHandler {

    constructor( handler = () => {}, options = {} ) {

        this.setHandler( handler );
        this.setValidation( options );
    }

    validate( event ) {

        this.validator.validate( event );
    }

    setHandler( handler ) {

        this.executor = executors.create( handler );
    }

    setValidation( options ) {

        this.validator = new Validator( options );
    }

    static create( args ) {

        if( args.length === 0 ) {

            return new MethodHandler();
        }

        let handler = extractHandler( args );
        let options = extractOptions( args );

        return new MethodHandler( handler, options )
    }
}

module.exports = MethodHandler;
