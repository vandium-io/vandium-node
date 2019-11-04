'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const MODULE_PATH = 'lib/event_types/api/index';

const vandium = require( '../../../' );

const apiHandler = require( '../index' );

describe( MODULE_PATH, function() {

    describe( 'handler', function() {

        it( 'normal operation', async function() {

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

            let result = await handler( event, {} );

            expect( result ).to.eql( { statusCode: 200, headers: {}, body: 'put called', isBase64Encoded: false } );
        });

        it( 'normal operation, with cookie', async function() {

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

            const result = await handler( event, {} );

            expect( result ).to.eql( { statusCode: 200, headers: {}, body: 'put called', isBase64Encoded: false } );
        });

        it( 'normal operation, with headers and cors', async function() {

            let handler = apiHandler();

            handler.PUT( {

                body: {

                    name: vandium.types.string().trim().required()
                }

            }, ( evt ) => {

                expect( evt.body.name ).to.equal( 'John Doe' );     // event contains padded input

                return 'put called';
            });

            handler.headers( {

                header1: 'HEADER1',
                header2: 'HEADER2'
            });

            handler.cors( {

                allowOrigin: 'https://whatever.vandium.io',
                allowCredentials: true
            });

            let event = require( './put-event.json'  );

            const result = await handler( event, {} );

            expect( result ).to.eql( {

                statusCode: 200,
                headers: {
                    header1: 'HEADER1',
                    header2: 'HEADER2',
                    "Access-Control-Allow-Credentials": "true",
                    "Access-Control-Allow-Origin": "https://whatever.vandium.io"
                },
                isBase64Encoded: false,
                body: 'put called'
            });
        });

        it( 'normal operation, with base64 encoded binary', async function() {

            let handler = apiHandler();
            let sampleBase64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQYV2P4DwABAQEAWk1v8QAAAABJRU5ErkJggg==';

            handler.GET( {}, ( evt ) => {
                return {
                    headers: {
                        'Content-Type': 'image/png'
                    },
                    isBase64Encoded: true,
                    body: sampleBase64Png
                }
            });

            let event = require( './get-event.json' );

            const result = await handler( event, {} );

            expect( result ).to.eql( { statusCode: 200, headers: { 'Content-Type': 'image/png'}, body: sampleBase64Png, isBase64Encoded: true } );
        });

        it( 'normal operation, with result containing a Buffer instance', async function() {

            let handler = apiHandler();
            let sampleBase64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQYV2P4DwABAQEAWk1v8QAAAABJRU5ErkJggg==';

            handler.GET( () => {
                return {
                    headers: {
                        'Content-Type': 'image/png'
                    },
                    body: Buffer.from( sampleBase64Png, 'base64' )
                }
            });

            let event = require( './get-event.json' );

            const result = await handler( event, {} );

            expect( result ).to.eql( { statusCode: 200, headers: { 'Content-Type': 'image/png'}, body: sampleBase64Png, isBase64Encoded: true } );
        });

        it( 'normal operation, with result containing a Buffer instance', async function() {

            let handler = apiHandler();
            let sampleBase64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQYV2P4DwABAQEAWk1v8QAAAABJRU5ErkJggg==';

            handler.header( 'Content-Type', 'image/png' )
                   .GET( () => {

                    return Buffer.from( sampleBase64Png, 'base64' );
                });

            let event = require( './get-event.json' );

            const result = await handler( event, {} );

            expect( result ).to.eql( { statusCode: 200, headers: { 'Content-Type': 'image/png'}, body: sampleBase64Png, isBase64Encoded: true } );
        });

        it( 'handle JWT failure', async function() {

            let handler = apiHandler()
                .jwt( {

                    algorithm: 'HS256',
                    key: 'secret'
                })
                .PUT( ( evt ) => {

                    expect( evt.body.name ).to.equal( 'John Doe' );     // event contains padded input

                    return 'put called';
                });

            let event = require( './put-event.json'  );

            const result = await handler( event, {} );

            expect( result.statusCode ).to.equal( 403 );
            expect( result.body ).to.equal( '{"type":"AuthenticationFailureError","message":"authentication error: missing jwt token"}' );
        });

        it( 'validation failure', async function() {

            let handler = apiHandler();

            handler.GET( {}, function() { return 'get called'; });
            handler.DELETE( {}, function() { return 'delete called'; });

            handler.PUT( {

                body: {

                    name: vandium.types.string().trim().required(),
                    age: vandium.types.number().required()
                }

            }, ( evt ) => {

                expect( evt.body.name ).to.equal( 'John Doe' );     // event contains padded input

                return 'put called';
            });

            let event = require( './put-event.json' );

            const result = await handler( event, {} );

            expect( result.statusCode ).to.equal( 400 );
            expect( result.body ).to.contain( '"type":"ValidationError"' );
            expect( result.isBase64Encoded ).to.be.false;
            expect( result.headers ).to.eql( {} );
        });
    });
});
