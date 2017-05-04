'use strict';

const vandium = require( 'vandium' );

module.exports.hello = vandium.api()
        .GET( ( event ) => {

                return {

                    statusCode: 200,
                    body: JSON.stringify({

                        message: 'hello world with GET',
                    }),
                };
            })
            .POST( ( event ) => {

                return {

                    statusCode: 201,
                    body: JSON.stringify({

                        message: 'hello world with POST',
                    }),
                };
            });
