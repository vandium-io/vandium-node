'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const freshy = require( 'freshy' );

const sinon = require( 'sinon' );


describe( 'lib/config/s3', function() {

    var getObjectStub;
    var getObjectSpy;

    var s3Loader;

    describe( '.load', function() {

        beforeEach( function() {

            freshy.unload( 'aws-sdk' );
            freshy.unload( '../../../lib/config/s3' );

            var AWS = require( 'aws-sdk' );

            getObjectStub = sinon.stub();

            getObjectSpy = sinon.spy( getObjectStub );

            AWS.S3.prototype.getObject = getObjectSpy;

            s3Loader = require( '../../../lib/config/s3' );
        });

        it( 'normal operation', function( done ) {

            var controlJSON = {

                jwt: {

                    token_name: 'bearer'
                }
            };

            getObjectStub.yieldsAsync( null, { Body: JSON.stringify( controlJSON ) } );

            s3Loader.load( { bucket: 'My-Bucket', key: 'My-Key' }, function( err, json ) {

                expect( err ).to.not.exist;
                expect( json ).to.eql( controlJSON );

                expect( getObjectSpy.calledWith( { Bucket: 'My-Bucket', Key: 'My-Key' } ) ).to.equal( true );

                done();
            });
        });

        it( 's3 error condition', function( done ) {

            var problem = new Error( 'bang' );

            getObjectStub.yieldsAsync( problem );

            s3Loader.load( { bucket: 'My-Bucket', key: 'My-Key' }, function( err, json ) {

                expect( err ).to.exist;
                expect( err ).to.equal( problem );
                expect( json ).to.not.exist;

                expect( getObjectSpy.calledWith( { Bucket: 'My-Bucket', Key: 'My-Key' } ) ).to.equal( true );

                done();
            });
        });
    });

    after( function() {

        freshy.unload( 'aws-sdk' );
    });

});
