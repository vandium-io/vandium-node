'use strict';

/*jshint expr: true*/

var expect = require( 'chai' ).expect;

const MODULE_PATH = 'lib/event_types/api/index';

const vandium = require( '../../../../' );

const apiHandler = require( '../../../../' + MODULE_PATH );

function runHandler( handler, event, context ) {

    return new Promise( (resolve, reject ) => {

        handler( event, context, (err,result) => {

            if( err ) {

                return reject( err );
            }

            resolve( result );
        });
    })
}

describe( MODULE_PATH, function() {

    describe( 'handler', function() {

        it( 'normal operation', function() {

            let handler = apiHandler();

            handler.GET( {}, function() { return 'get called'; });
            handler.DELETE( {}, function() { return 'delete called'; });

            handler.PUT( {

                body: {

                    name: vandium.types.string().trim().required()
                }

            }, ( evt ) => {

                expect( evt.body.name ).to.equal( 'John Doe' );     // event contains padded input
                
                return 'put called';
            });

            let event = require( './put-event.json' );

            return runHandler( handler, event, {} )
                .then( (result) => {

                    expect( result ).to.equal( 'put called' );
                });
        });
    });
});
