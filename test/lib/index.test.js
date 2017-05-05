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

                    expect( result ).to.eql( { statusCode: 200, headers: {}, body: 'ok' } );
                });
        });
    });

    describe( '.s3', function() {

        it( 'normal operation', function() {

            expect( vandium.s3 ).to.exist;

            return LambdaTester( vandium.s3( (records) => {

                    expect( records[0].s3.bucket.name ).to.equal( 'sourcebucket' );

                    return 'ok';
                }))
                .event( require( '../json/s3-put.json' ) )
                .expectResult( (result) => {

                    expect( result ).to.equal( 'ok' );
                });
        });
    });

    describe( '.dyanmodb', function() {

        it( 'normal operation', function() {

            expect( vandium.dynamodb ).to.exist;

            return LambdaTester( vandium.dynamodb( (records) => {

                    expect( records[0].dynamodb ).to.exist;

                    return 'ok';
                }))
                .event( require( '../json/dynamodb.json' ) )
                .expectResult( (result) => {

                    expect( result ).to.equal( 'ok' );
                });
        });
    });

    describe( '.sns', function() {

        it( 'normal operation', function() {

            expect( vandium.sns ).to.exist;

            return LambdaTester( vandium.sns( (records) => {

                    expect( records[0].Sns ).to.exist;

                    return 'ok';
                }))
                .event( require( '../json/sns.json' ) )
                .expectResult( (result) => {

                    expect( result ).to.equal( 'ok' );
                });
        });
    });

    describe( '.ses', function() {

        it( 'normal operation', function() {

            expect( vandium.ses ).to.exist;

            return LambdaTester( vandium.ses( (records) => {

                    expect( records[0].ses ).to.exist;

                    return 'ok';
                }))
                .event( require( '../json/ses.json' ) )
                .expectResult( (result) => {

                    expect( result ).to.equal( 'ok' );
                });
        });
    });

    describe( '.kinesis', function() {

        it( 'normal operation', function() {

            expect( vandium.kinesis ).to.exist;

            return LambdaTester( vandium.kinesis( (records) => {

                    expect( records[0].kinesis ).to.exist;

                    return 'ok';
                }))
                .event( require( '../json/kinesis.json' ) )
                .expectResult( (result) => {

                    expect( result ).to.equal( 'ok' );
                });
        });
    });

    describe( '.scheduled', function() {

        it( 'normal operation', function() {

            expect( vandium.scheduled ).to.exist;

            return LambdaTester( vandium.scheduled( (event) => {

                    expect( event[ 'detail-type' ] ).to.exist;

                    return 'ok';
                }))
                .event( require( '../json/scheduled.json' ) )
                .expectResult( (result) => {

                    expect( result ).to.equal( 'ok' );
                });
        });
    });

    describe( '.cloudwatch', function() {

        it( 'normal operation', function() {

            expect( vandium.cloudwatch ).to.exist;

            return LambdaTester( vandium.cloudwatch( (event) => {

                    expect( event.awslogs ).to.exist;

                    return 'ok';
                }))
                .event( require( '../json/cloudwatch.json' ) )
                .expectResult( (result) => {

                    expect( result ).to.equal( 'ok' );
                });
        });
    });

    describe( '.cloudformation', function() {

        it( 'normal operation', function() {

            expect( vandium.cloudformation ).to.exist;

            return LambdaTester( vandium.cloudformation( (event) => {

                    expect( event.StackId ).to.exist;

                    return 'ok';
                }))
                .event( require( '../json/cloudformation.json' ) )
                .expectResult( (result) => {

                    expect( result ).to.equal( 'ok' );
                });
        });
    });

    describe( '.cognito', function() {

        it( 'normal operation', function() {

            expect( vandium.cognito ).to.exist;

            return LambdaTester( vandium.cognito( (event) => {

                    expect( event.identityId ).to.exist;

                    return 'ok';
                }))
                .event( require( '../json/cognito.json' ) )
                .expectResult( (result) => {

                    expect( result ).to.equal( 'ok' );
                });
        });
    });

    describe( '.lex', function() {

        it( 'normal operation', function() {

            expect( vandium.lex ).to.exist;

            return LambdaTester( vandium.lex( (event) => {

                    expect( event.currentIntent ).to.exist;

                    return 'ok';
                }))
                .event( require( '../json/lex.json' ) )
                .expectResult( (result) => {

                    expect( result ).to.equal( 'ok' );
                });
        });
    });
});
