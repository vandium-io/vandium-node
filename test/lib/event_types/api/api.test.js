'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const helper = require( '../helper' );

const MODULE_PATH = 'lib/event_types/api/index';

const vandium = require( '../../../../' );

const apiHandler = require( '../../../../' + MODULE_PATH );

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

            return helper.asPromise( handler, event, {} )
                .then( (result) => {

                    expect( result ).to.eql( { statusCode: 200, headers: {}, body: 'put called' } );
                });
        });

        it( 'normal operation, with cookie', function() {

            let handler = apiHandler();

            handler.PUT( {

                body: {

                    name: vandium.types.string().trim().required()
                }

            }, ( evt ) => {

                expect( evt.body.name ).to.equal( 'John Doe' );     // event contains padded input

                expect( evt.cookies ).to.eql( {

                    firstcookie: 'chocolate',
                  secondcookie: 'chip',
                  thirdcookie: 'strawberry'
                });

                return 'put called';
            });

            let event = require( './put-with-cookies-event.json' );

            return helper.asPromise( handler, event, {} )
                .then( (result) => {

                    expect( result ).to.eql( { statusCode: 200, headers: {}, body: 'put called' } );
                });
        });
    });
});
