'use strict';

const utils = require( '../../lib/utils' );

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

                let context = Object.assign( {}, this._context );

                context.succeed = function( result ) {

                    try {

                        validator( null, result );

                        resolve();
                    }
                    catch( err ) {

                        reject( err );
                    }
                };

                context.fail = function( err ) {

                    try {

                        validator( err );

                        resolve();
                    }
                    catch( err ) {

                        reject( err );
                    }
                };

                context.done = function( err, result ) {

                    try {

                        validator( err, result );

                        resolve();
                    }
                    catch( err ) {

                        reject( err );
                    }
                };

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

    expectError( validator ) {

        if( !validator ) {

            throw new Error( 'missing validator' );
        }

        return this.execute( ( err ) => {

            if( !err ) {

                throw new Error( 'expecting error' );
            }

            validator( err );
        });
    }

    expectResult( validator ) {

        if( !validator ) {

            throw new Error( 'missing validator' );
        }

        return this.execute( ( err, result ) => {

            if( err ) {

                throw new Error( 'expecting result' );
            }

            validator( result );
        });
    }
}

module.exports = function( handler ) {

    return new HandlerInvoker( handler );
}
