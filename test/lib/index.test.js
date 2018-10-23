'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const fs = require( 'fs' );

const LambdaTester = require( 'lambda-tester' );

const appRoot = require( 'app-root-path' );

const proxyquire = require( 'proxyquire' );

const VANDIUM_MODULE_PATH = '../../lib/index';

const envRestorer = require( 'env-restorer' );


describe( 'lib/index', function() {

    let vandium;

    function getEvent( type, json ) {

        if( !json ) {

            json = `${type}.json`;
        }

        return require( `../json/${json}` );
    }

    function doHandlerValidation( desc, type, verifier, json ) {

        it( desc, function() {

            expect( vandium[ type ] ).to.exist;

            return LambdaTester( vandium[ type ]( (eventData) => {

                    verifier( eventData );

                    return 'ok';
                }))
                .event( getEvent( type, json ) )
                .expectResult( (result) => {

                    expect( result ).to.equal( 'ok' );
                });
        });
    }

    function validateHandler( type, verifier, json ) {

        doHandlerValidation( 'normal operation', type, verifier, json );
    }

    beforeEach( function() {

        // remove config file
        try {

            fs.unlinkSync( appRoot + '/vandium.json' );
        }
        catch( err ) {

            if( err.code !== 'ENOENT' ) {

                // some other reason that we couldn't remove the config file - not good
                throw err;
            }
            // else ignore
        }

        envRestorer.restore();

        // fresh copy please
        vandium = proxyquire( VANDIUM_MODULE_PATH, {} );
    });

    after( function() {

        // NEED to disable eval prevention
        process.env.VANDIUM_PREVENT_EVAL = "false"
        require( '../../lib/prevent' ).configure();

        envRestorer.restore();
    });

    describe( '.api', function() {

        it( 'normal operation', function() {

            expect( vandium.api ).to.exist;

            return LambdaTester( vandium.api()
                    .PUT( (event) => {

                        expect( event.httpMethod ).to.equal( 'PUT' );

                        return 'ok'
                    })
                )
                .event( require( '../json/apigateway.json' ) )
                .expectResult( (result) => {

                    expect( result ).to.eql( { statusCode: 200, headers: {}, body: 'ok', isBase64Encoded: false } );
                });
        });
    });


    describe( '.scheduled', function() {

        validateHandler( 'scheduled', (event) => {

            expect( event[ 'detail-type' ] ).to.exist;
        });

        it( 'custom event using JSON object', function() {

            expect( vandium.scheduled ).to.exist;

            return LambdaTester( vandium.scheduled( { customEvent: true }, (event) => {

                    expect( event ).to.eql( { one: 1, two: 'II', three: 'three' } );

                    return 'ok';
                }))
                .event( { one: 1, two: 'II', three: 'three' } )
                .expectResult( (result) => {

                    expect( result ).to.equal( 'ok' );
                });
        });

        it( 'custom event using constant value', function() {

            expect( vandium.scheduled ).to.exist;

            return LambdaTester( vandium.scheduled( { customEvent: true }, (event) => {

                    expect( event ).to.equal( 42 );

                    return 'ok';
                }))
                .event( 42 )
                .expectResult( (result) => {

                    expect( result ).to.equal( 'ok' );
                });
        });
    });


    // records
    [
        // type, verificationProperty
        [ 'dynamodb', 'dynamodb' ],
        [ 'sns', 'Sns' ],
        [ 'ses', 'ses' ],
        [ 'kinesis', 'kinesis' ],
        [ 'sqs', 'messageId' ],
        [ 's3', 's3' ],
        [ 'cloudfront', 'cf' ],
        [ 'firehose', 'kinesisRecordMetadata', 'kinesis-firehose.json' ]

    ].forEach( function( typeInfo ) {

        let type = typeInfo[0];
        let verificationProperty = typeInfo[1];
        let json = typeInfo[2];

        describe( `.${type}`, function() {

            validateHandler( type, (records) => {

                expect( records[0][verificationProperty] ).to.exist;
            }, json );
        });
    });

    // simple
    [

        [ 'lex', 'currentIntent' ],
        [ 'cognito', 'identityId' ],
        [ 'cloudformation', 'StackId' ],
        [ 'cloudwatch', 'awslogs' ],
        [ 'config', 'invokingEvent' ],
        [ 'iotButton', 'clickType', 'iot-button.json' ]

    ].forEach( function( typeInfo ) {

        let type = typeInfo[0];
        let verificationProperty = typeInfo[1];
        let json = typeInfo[2];

        describe( `.${type}`, function() {

            validateHandler( type, (event) => {

                expect( event[verificationProperty] ).to.exist;
            }, json );
        });
    });
});
