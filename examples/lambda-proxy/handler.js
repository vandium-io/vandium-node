'use strict';

const vandium = require( 'vandium' );

exports.handler = vandium.createInstance( {

            lambdaProxy: true,
            validation: {

                schema: {

                    body: {

                        firstName: vandium.types.string().min( 1 ).max( 250 ).required(),

                        lastName: vandium.types.string().min( 1 ).max( 250 ).required(),

                        age: vandium.types.number().min( 0 ).max( 130 ).required()
                    }
                }
            }
        })
        .handler( function( event /*, context, callback*/ ) {

            // log event ?
            // console.log( JSON.stringify( event, null, 2 ) );

            // echo body portion
            return Promise.resolve( event.body );
        });
