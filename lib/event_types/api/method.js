'use strict';

const Validator = require( './validator' );

const executors = require( '../executors' );

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
}

module.exports = MethodHandler;
