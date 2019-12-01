const { extractOptions, extractHandler } = require( './helper' );

const TypedHandler = require( './typed' );

function createHandler( type, ...args ) {

    return new TypedHandler( type, extractOptions( args ) )
        .handler( extractHandler( args ) )
        .createLambda();
}

module.exports = createHandler;
