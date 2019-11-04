'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const sinon = require( 'sinon' );

const record = require( '../record' );

describe( 'lib/event_types/record', function() {

    it( 'normal operation, no options, no callback, no finally', async function() {

        let myHandler = function( records ) {

                    return records[0].s3.object.key;
                };

        let lambda = record( 's3', myHandler );

        const result = await lambda( require( './s3-put' ), { /*context*/} );

        expect( result ).to.equal( 'HappyFace.jpg' );
    });

    it( 'normal operation, options, no callback, no finally', async function() {

        let myHandler = function( records ) {

                    return records[0].s3.object.key;
                };

        let lambda = record( 's3', { /* options*/ }, myHandler );

        const result = await lambda( require( './s3-put' ), { /*context*/} );

        expect( result ).to.equal( 'HappyFace.jpg' );
    });

    it( 'normal operation, options, callback, no finally', async function() {

        let myHandler = function( records, context, callback ) {

                    callback( null, records[0].s3.object.key );
                };

        let lambda = record( 's3', { /* options*/ }, myHandler );

        const result = await lambda( require( './s3-put' ), { /*context*/} );

        expect( result ).to.equal( 'HappyFace.jpg' );
    });

    it( 'normal operation, options, callback, finally', async function() {

        let myHandler = function( records, context, callback ) {

                    callback( null, records[0].s3.object.key );
                };

        let after = sinon.stub();

        let lambda = record( 's3', { /* options*/ }, myHandler ).finally(  after );

        const result = await lambda( require( './s3-put' ), { /*context*/} );

        expect( result ).to.equal( 'HappyFace.jpg' );

        expect( after.calledOnce ).to.be.true;
        expect( after.firstCall.args.length ).to.equal( 1 );
    });

    it( 'normal operation for "records" vs "Records"', async function() {

        let myHandler = function( records, context, callback ) {

                    callback( null, records[0].recordId );
                };

        let after = sinon.stub();

        let lambda = record( 'kinesis-firehose', { /* options*/ }, myHandler ).finally(  after );

        const result = await lambda( require( './kinesis-firehose.json' ), { /*context*/} );

        expect( result ).to.equal( 'record1' );

        expect( after.calledOnce ).to.be.true;
        expect( after.firstCall.args.length ).to.equal( 1 );
    });

    it( 'fail for unknown record', async function() {

        let myHandler = sinon.stub();

        let after = sinon.stub();

        let lambda = record( 's3', { /* options*/ }, myHandler ).finally(  after );

        try {

            await lambda( { "Records": [ { whatever: {} } ]}, { /*context*/} );

            should.fail( 'should throw error' );
        }
        catch( err ) {

            expect( err.message ).to.contain( 'Expected event type of s3' );

            expect( myHandler.called ).to.be.false;
            expect( after.called ).to.be.false;
        }
    });
});
