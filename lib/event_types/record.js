const { extractOptions, extractHandler } = require( './helper' );

const TypedHandler = require( './typed' );

function eventProc( event ) {

    return event.Records || event.records;
}

function createHandler( type, ...args ) {

    return new TypedHandler( type, extractOptions( args ) )
        .eventProcessor( eventProc )
        .handler( extractHandler( args ) )
        .createLambda();
}

module.exports = createHandler;
