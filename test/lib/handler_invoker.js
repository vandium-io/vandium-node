'use strict';

class HandlerInvoker {

    constructor( handler ) {

        if( !handler ) {

            throw new Error( 'missing handler' );
        }

        this._handler = handler;
        this._event = {};
        this._context = {};
    }

    event( evt ) {

        this._event = evt || {};

        return this;
    }

    context( ctx ) {

        this._context = ctx || {};

        return this;
    }

    execute( validator ) {

        if( !validator ) {

            throw new Error( 'missing validator' );
        }

        return new Promise( ( resolve, reject ) => {

            try {

                this._handler( this._event, this._context, (err,result) => {

                    try {

                        validator( err, result );

                        resolve();
                    }
                    catch( err ) {

                        reject( err );
                    }
                });
            }
            catch( err ) {

                reject( err );
            }
        });
    }
}

module.exports = function( handler ) {

    return new HandlerInvoker( handler );
}
