'use strict';

function asPromise( handler, ...args ) {

    return new Promise( (resolve, reject ) => {

        let handlerArgs = args.slice();

        handlerArgs.push( (err,result) => {

            if( err ) {

                return reject( err );
            }

            resolve( result );
        });

        handler( ...handlerArgs );
    });
}

module.exports = {

    asPromise
};
