/**
 * Creates handlers
 */

const { apigateway } = require( './event_types/api')

async function execute( { event, context, handler, hooks } ) {

  handler.execute( event, context, hooks );
}

function createHandler( builder ) {

  const handlerTypes = { apigateway };

  const handler = builder( handlerTypes );

  const lambda = async (event, context) => {

    return await execute( { event, context, handler } );
  };

  lambda.withHooks = ( hooks ) => {

    return async ( event, context ) => {

      await execute( { event, context, handler, hooks } );
    };
  }

  return lambda;
}

module.exports = createHandler;
