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

exports.handler = vandium.api()
        .GET()
        .validation({

            queryStringParameters: {

                offset: vandium.types.number(),
                expand: vandium.types.boolean()
            }
        })
        .handler( async (event) => {

            let offset = event.queryStringParameters.offset;
            let expand = event.queryStringParameters.expand;

            const users = await getUsers( offset, expand );

            return { users, offset };
        });
