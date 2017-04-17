'use strict';

const Validator = require( './validator' );

const executors = require( '../executors' );

class MethodHandler {

    constructor( handler, options ) {

        this.executor = executors.create( handler );

        this.validator = new Validator( options );
    }

    validate( event ) {

        this.validator.validate( event );
    }
}

module.exports = MethodHandler;
