'use strict';

const MethodHandler = require( './method' );

const HTTP_METHODS =  [ 'GET', 'PUT', 'POST', 'DELETE', 'PATCH', 'HEAD' ];


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

    execute( event, context, callback ) {

        try {

            let method = event.httpMethod;

            if( !method ) {

                throw new Error( 'Missing httpMethod property in event object' );
            }

            let handler = this.methodHandlers[ method ];

            if( !handler ) {

                throw new Error( 'Handler not defined for http method: ' + method );
            }

            Promise.resolve()
                .then( () => {

                    return handler.execute( event, context )
                })
                .then( (result) => {

                    // do finally

                    callback( null, result );
                })
                .catch( ( err ) => {

                    // do finally

                    callback( err );
                })
        }
        catch( err ) {

            callback( err );
        }
    }

    finally() {

        // TODO: add finally handler
    }

    _addHandler( type, ...args ) {

        this.methodHandlers[ type ] = createMethodHandler( args );
        return this;
    }
}

// add http methods to APIHandler class
HTTP_METHODS.forEach( (methodType) => {

    APIHandler.prototype[ methodType ] = function( ...args ) {

        return this._addHandler( methodType, args );
    }
});


function addMethodsToHandler( outerHandler, apiHandler ) {

    HTTP_METHODS.forEach( (methodType) => {

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
}

function createHandler( options ) {

    let apiHandler = new APIHandler( options );

    let outerHandler = function( event, context, callback ) {

        apiHandler.execute( event, context, callback );
    };

    addMethodsToHandler( outerHandler, apiHandler );

    return outerHandler;
}


module.exports = createHandler;
