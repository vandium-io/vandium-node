'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const sinon = require( 'sinon' );

const record = require( '../../../lib/event_types/record' );

describe( 'lib/event_types/record', function() {

    it( 'normal operation, no options, no callback, no finally', function( done ) {

        let myHandler = function( records ) {

                    return records[0].s3.object.key;
                };

        let lambda = record( 's3', myHandler );

        expect( lambda ).to.be.a( 'function' );
        expect( lambda.length ).to.equal( 3 );

        lambda( require( './s3-put' ), { /*context*/}, (err, result) => {

            try {

                expect( err ).to.not.exist;
                expect( result ).to.equal( 'HappyFace.jpg' );

                done();
            }
            catch( e ) {

                done( e );
            }
        });
    });

    it( 'normal operation, options, no callback, no finally', function( done ) {

        let myHandler = function( records ) {

                    return records[0].s3.object.key;
                };

        let lambda = record( 's3', { /* options*/ }, myHandler );

        lambda( require( './s3-put' ), { /*context*/}, (err, result) => {

            try {

                expect( err ).to.not.exist;
                expect( result ).to.equal( 'HappyFace.jpg' );

                done();
            }
            catch( e ) {

                done( e );
            }
        });
    });

    it( 'normal operation, options, callback, no finally', function( done ) {

        let myHandler = function( records, context, callback ) {

                    callback( null, records[0].s3.object.key );
                };

        let lambda = record( 's3', { /* options*/ }, myHandler );

        lambda( require( './s3-put' ), { /*context*/}, (err, result) => {

            try {

                expect( err ).to.not.exist;
                expect( result ).to.equal( 'HappyFace.jpg' );

                done();
            }
            catch( e ) {

                done( e );
            }
        });
    });

    it( 'normal operation, options, callback, finally', function( done ) {

        let myHandler = function( records, context, callback ) {

                    callback( null, records[0].s3.object.key );
                };

        let after = sinon.stub();

        let lambda = record( 's3', { /* options*/ }, myHandler ).finally(  after );

        lambda( require( './s3-put' ), { /*context*/}, (err, result) => {

            try {

                expect( err ).to.not.exist;
                expect( result ).to.equal( 'HappyFace.jpg' );

                expect( after.calledOnce ).to.be.true;
                expect( after.firstCall.args.length ).to.equal( 1 );
                done();
            }
            catch( e ) {

                done( e );
            }
        });
    });

    it( 'normal operation for "records" vs "Records"', function( done ) {

        let myHandler = function( records, context, callback ) {

                    callback( null, records[0].recordId );
                };

        let after = sinon.stub();

        let lambda = record( 'kinesis-firehose', { /* options*/ }, myHandler ).finally(  after );

        lambda( require( '../../json/kinesis-firehose.json' ), { /*context*/}, (err, result) => {

            try {

                expect( err ).to.not.exist;
                expect( result ).to.equal( 'record1' );

                expect( after.calledOnce ).to.be.true;
                expect( after.firstCall.args.length ).to.equal( 1 );
                done();
            }
            catch( e ) {

                done( e );
            }
        });
    });

    it( 'fail for unknown record', function( done ) {

        let myHandler = sinon.stub();

        let after = sinon.stub();

        let lambda = record( 's3', { /* options*/ }, myHandler ).finally(  after );

        lambda( { "Records": [
                { whatever: {} }
            ]}, { /*context*/}, (err, result) => {

            try {

                expect( err ).to.exist;
                expect( err.message ).to.contain( 'Expected event type of s3' );

                expect( result ).to.not.exist;
                expect( myHandler.called ).to.be.false;
                expect( after.called ).to.be.false;

                done();
            }
            catch( e ) {

                done( e );
            }
        });
    });
});
