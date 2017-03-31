'use strict';

const Validator = require( './validator' );

const executors = require( '../executors' );

class MethodHandler {

    constructor( handler, options ) {

        this.handler = handler;

        this.executor = executors.create( handler );

        this.validator = new Validator( options );
    }

    /**
     * @Promise
     */
    execute( event, handlerContext ) {

        this.validator.validate( event );

        return this.executor( event, handlerContext );
    }
}

module.exports = MethodHandler;
