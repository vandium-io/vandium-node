 const Validator = require( './validator' );

const executors = require( '../executors' );

class MethodHandler {

    constructor() {

        this.setHandler( () => {} );
        this.setValidation( {} );
        this.setOnResponse( (response) => response );
    }

    setHandler( handler ) {

        this._executor = executors.create( handler );
    }

    setValidation( options ) {

        this._validator = new Validator( options );
    }

    setOnResponse( onResponse ) {

        this._onResponse = onResponse;
    }

    get validator() {

        return this._validator;
    }

    get executor() {

        return this._executor;
    }

    get onResponse() {

        return this._onResponse;
    }
}

module.exports = MethodHandler;
