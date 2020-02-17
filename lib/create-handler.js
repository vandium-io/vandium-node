/**
 * Creates handlers
 */

const { handlerTypes } = require( './event_types')

function createHandler( builder ) {

  const handler = builder( handlerTypes );

  if( !handler ) {

    throw new Error( 'Handler must be returned when using createHandler()' );
  }
  else if( !handler.execute ) {

    throw new Error( 'Handler does not contain execute(), are you sure that you returned the correct value?' );
  }

  const lambda = async (event, context) => await handler.execute( event, context );

  lambda.withHooks = ( hooks ) => async ( event, context ) => await handler.execute( event, context, hooks );

  return lambda;
}

module.exports = createHandler;
