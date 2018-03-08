'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const MODULE_PATH = 'lib/event_types/api/index';

const vandium = require( '../../../../' );

const apiHandler = require( '../../../../' + MODULE_PATH );

describe( MODULE_PATH, function() {

    describe( 'handler', function() {

        it( 'normal operation', function( done ) {

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

            handler( event, {}, (err,result) => {

                try {

                    expect( result ).to.eql( { statusCode: 200, headers: {}, body: 'put called', isBase64Encoded: false } );
                    done();
                }
                catch( e ) {

                    done( e );
                }
            });
        });

        it( 'normal operation, with cookie', function( done ) {

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

            handler( event, {}, (err,result) => {

                try {

                    expect( result ).to.eql( { statusCode: 200, headers: {}, body: 'put called', isBase64Encoded: false } );
                    done();
                }
                catch( e ) {

                    done( e );
                }
            });
        });

        it( 'normal operation, with headers and cors', function( done ) {

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

            handler( event, {}, (err,result) => {

                try {

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

                    done();
                }
                catch( e ) {

                    done( e );
                }
            });
        });

        it( 'normal operation, with base64 encoded binary', function( done ) {

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

            handler( event, {}, (err,result) => {

                try {

                    expect( result ).to.eql( { statusCode: 200, headers: { 'Content-Type': 'image/png'}, body: sampleBase64Png, isBase64Encoded: true } );
                    done();
                }
                catch( e ) {

                    done( e );
                }
            });
        });

        it( 'normal operation, with result containing a Buffer instance', function( done ) {

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

            handler( event, {}, (err,result) => {

                try {

                    expect( result ).to.eql( { statusCode: 200, headers: { 'Content-Type': 'image/png'}, body: sampleBase64Png, isBase64Encoded: true } );
                    done();
                }
                catch( e ) {

                    done( e );
                }
            });
        });

        it( 'normal operation, with result containing a Buffer instance', function( done ) {

            let handler = apiHandler();
            let sampleBase64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQYV2P4DwABAQEAWk1v8QAAAABJRU5ErkJggg==';

            handler.header( 'Content-Type', 'image/png' )
                   .GET( () => {

                    return Buffer.from( sampleBase64Png, 'base64' );
                });

            let event = require( './get-event.json' );

            handler( event, {}, (err,result) => {

                try {

                    expect( result ).to.eql( { statusCode: 200, headers: { 'Content-Type': 'image/png'}, body: sampleBase64Png, isBase64Encoded: true } );
                    done();
                }
                catch( e ) {

                    done( e );
                }
            });
        });

        it( 'handle JWT failure', function( done ) {

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

            handler( event, {}, (err,result) => {

                try {

                    expect( result.statusCode ).to.equal( 403 );
                    expect( result.body ).to.equal( '{"type":"AuthenticationFailureError","message":"authentication error: missing jwt token"}' );

                    done();
                }
                catch( e ) {

                    done( e );
                }
            });
        });

        it( 'validation failure', function( done ) {

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

            handler( event, {}, (err,result) => {

                try {

                    expect( result.statusCode ).to.equal( 400 );
                    expect( result.body ).to.contain( '"type":"ValidationError"' );
                    expect( result.isBase64Encoded ).to.be.false;
                    expect( result.headers ).to.eql( {} );
                    done();
                }
                catch( e ) {

                    done( e );
                }
            });
        });
    });
});
