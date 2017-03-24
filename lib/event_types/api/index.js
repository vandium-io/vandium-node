'use strict';

const MethodHandler = require( './method' );

function extractOptions( args ) {

    return (args.length === 1 ? {} : args[0] );
}

function extractHandler( args ) {

    return (args.length === 1 ? args[0] : args[1] );
}

function createMethodHandler( args ) {

    let handler = extractHandler( args );
    let options = extractOptions( args );

    return new MethodHandler( handler, options )
}


class APIHandler {

    constructor() {

        this.methodHandlers = {};
    }

    //execute( event,)

    finally() {

        // TODO: add finally handler
    }

    _addHandler( type, ...args ) {

        this.methodHandlers[ type ] = createMethodHandler( args );
        return this;
    }
}

[
    'GET', 'PUT', 'POST', 'DELETE', 'PATCH', 'HEAD'

].forEach( (methodType) => {

    APIHandler.prototype[ methodType ] = function( ...args ) {

        return this._addHandler( methodType, args );
    }
});

function createHandler( options ) {

    let apiHandler = new APIHandler( options );

    let outerHandler = function( event, context, callback ) {

        console.log( apiHandler );

        callback();
    };

    [
        'GET', 'PUT', 'POST', 'DELETE', 'PATCH', 'HEAD'

    ].forEach( (methodType) => {

        outerHandler[ methodType ] = function( ...args ) {

            apiHandler[ methodType ]( ...args );
            return outerHandler;
        }

        outerHandler[ methodType.toLowerCase() ] = function( ...args ) {

            apiHandler[ methodType ]( ...args );
            return outerHandler;
        }
    });

    outerHandler.finally = function( ...args ) {

        apiHandler.finally( ...args );

        return outerHandler;
    }

    return outerHandler;
}


module.exports = createHandler;
