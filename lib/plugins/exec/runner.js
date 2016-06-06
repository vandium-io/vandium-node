'use strict';

const stages = require( '../../stages' );

const utils = require( '../../utils' );

function wrapCallback( callback ) {

    let called = false;

    let wrappedCallback = function( error, result ) {

        called = true;

        callback( error, result );
    };

    Object.defineProperty( wrappedCallback, 'called', {

        enumerable: false,
        configurable: false,
        get: function() {

            return called;
        }
    });

    return wrappedCallback;
}



function fixupContext( context, callback ) {

    context.succeed = function( result ) {

        callback( null, result );
    }

    context.fail = function( err ) {

        if( !err ) {

            err = new Error();
        }

        callback( err );
    }

    context.done = callback;

    return context;
}

function install( pipeline, userFunc ) {

    pipeline.add( 'exec', function( pipelineEvent, callback ) {

        let context;

        try {

            pipelineEvent.session.updateStage( stages.EXEC );

            callback = wrapCallback( callback );

            context = fixupContext( pipelineEvent.context, callback );

            let retValue = userFunc( pipelineEvent.event, context, callback );

            if( utils.isPromise( retValue ) ) {

                retValue
                    .then( function( value ) {

                        callback( null, value );
                    })
                    .catch( function( err ) {

                        callback( err );
                    });
            }
            else if( retValue !== undefined ) {

                pipelineEvent.returnValue = retValue;

                if( !callback.called ) {

                    callback( null, retValue );
                }
            }
        }
        catch( err ) {

            callback( err );
        }
        finally {

            // remove handlers
            delete context.succeed;
            delete context.fail;
            delete context.done;
        }
    });
}


module.exports = {

    install
};
