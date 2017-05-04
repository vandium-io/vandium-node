'use strict';

const vandium = require( 'vandium' );

module.exports.hello = vandium.api()
        .GET( ( event ) => {

            const users = [

                {
                    id: 111,
                    name: 'Joe Bloggs'
                },
                {
                    id: 222,
                    name: 'Jon Doe'
                },
                {
                    id: 333,
                    name: 'Fred Smith'
                }
            ];

            return { users };
        });
