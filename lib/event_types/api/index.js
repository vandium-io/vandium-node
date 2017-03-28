'use strict';

const constants = require( './constants' );

const APIHandler = require( './api_handler' );

function addMethodsToHandler( outerHandler, apiHandler ) {

    constants.HTTP_METHODS.forEach( (methodType) => {

        outerHandler[ methodType ] = function( ...args ) {

            apiHandler[ methodType ]( ...args );
            return outerHandler;
        }

        outerHandler[ methodType.toLowerCase() ] = function( ...args ) {

            apiHandler[ methodType ]( ...args );
            return outerHandler;
        }
    });

    outerHandler.jwt = function( ...args ) {

        apiHandler.jwt( ...args );

        return outerHandler;
    }

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
