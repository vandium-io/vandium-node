const { extractOptions, extractHandler } = require( './helper' );

const TypedHandler = require( './typed' );

function createHandler( type, ...args ) {

    return new TypedHandler( 'cloudwatch',extractOptions( args ) )
        .matchSubType( type )
        .handler( extractHandler( args ) )
        .createLambda();
}

module.exports = createHandler;
