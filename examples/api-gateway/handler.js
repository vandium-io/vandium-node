'use strict';

const vandium = require( 'vandium' );

function getUsers( offset, expand ) {

    let users = [];

    // TODO: read users from database
    users.push( {

        firstName: 'Jon',
        lastName: 'Doe',
        age: 42
    });

    return Promise.resolve( users );
}

function addUser( firstName, lastName, age ) {

    // TODO: add user to database

    return Promise.resolve( { id: Date.now(), firstName, lastName, age } );
}

exports.handler = vandium.api()
        .GET( {

                queryStringParameters: {

                    offset: vandium.types.number(),
                    expand: vandium.types.boolean()
                }
            },
            (event) => {

                let offset = event.queryStringParameters.offset;
                let expand = event.queryStringParameters.expand;

                return getUsers( offset, expand )
                    .then( (users) => {

                        return {

                            users,
                            offset
                        };
                    });
            })
        .POST( {

                body: {

                    firstName: vandium.types.string().min(1).max(250).required(),
                    lastName: vandium.types.string().min(1).max(250).required(),
                    age: vandium.types.number().min(0).max(130)
                }
            },
            (event) => {

                let firstName = event.body.firstName;
                let lastName = event.body.lastName;
                let age = event.body.age;

                return addUser( firstName, lastName, age );
            });
