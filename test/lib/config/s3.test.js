'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const proxyquire = require( 'proxyquire' ).noCallThru();

const sinon = require( 'sinon' );

const MODULE_PATH =  'lib/config/s3';

describe( MODULE_PATH, function() {

    let s3;

    let getObjectStub;

    let getObjectPromiseStub;

    beforeEach( function() {

        getObjectPromiseStub = sinon.stub();

        getObjectStub = sinon.stub().returns( {

            promise: getObjectPromiseStub
        });

        let s3Stub = {

            getObject: getObjectStub
        };

        let awsSDKStub = {

            S3: function() { return s3Stub; }
        }

        s3 = proxyquire( '../../../' + MODULE_PATH, {

                'aws-sdk': awsSDKStub
            });
    });

    describe( '.load', function() {

        it( 'normal operation', function() {

            const controlJSON = {

                jwt: {

                    token_name: 'bearer'
                }
            };

            getObjectPromiseStub.returns( Promise.resolve( { Body: JSON.stringify( controlJSON ) } ) );

            return s3.load( 'My-Bucket', 'My-Key' )
                .then( function( config ) {

                    expect( config ).to.eql( controlJSON );
                });
        });

        it( 'fail: error from s3', function() {

            getObjectPromiseStub.returns( Promise.reject( new Error( 'bang' ) ) );

            return s3.load( 'My-Bucket', 'My-Key' )
                .then(

                    function() {

                        throw new Error( 'should not resolve' );
                    },
                    function( err ) {

                        expect( err.message ).to.equal( 'bang' );
                    }
                );
        });
    });
});
