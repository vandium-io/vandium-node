const { expect } = require( 'chai' );

const sinon = require( 'sinon' );

const basic = require( '../basic' );

describe( 'lib/event_types/basic', function() {

    it( 'normal operation, no options, no callback, no finally', async function() {

        let myHandler = function( event ) {

                    return event.Records[0].s3.object.key;
                };

        let lambda = basic( 's3', myHandler );

        const result = await lambda( require( './s3-put' ), { /*context*/} );

        expect( result ).to.equal( 'HappyFace.jpg' );
    });

    it( 'normal operation, options, no callback, no finally', async function() {

        let myHandler = function( event ) {

                    return event.Records[0].s3.object.key;
                };

        let lambda = basic( 's3', { /* options*/ }, myHandler );

        const result = await lambda( require( './s3-put' ), { /*context*/} );

        expect( result ).to.equal( 'HappyFace.jpg' );
    });

    it( 'normal operation, options, callback, no finally', async function() {

        let myHandler = function( event ) {

                    return event.Records[0].s3.object.key;
                };

        let lambda = basic( 's3', { /* options*/ }, myHandler );

        const result = await lambda( require( './s3-put' ), { /*context*/} );

        expect( result ).to.equal( 'HappyFace.jpg' );
    });

    it( 'normal operation, options, callback, finally', async function() {

        let myHandler = function( event, context, callback ) {

                    callback( null, event.Records[0].s3.object.key );
                };

        let after = sinon.stub();

        let lambda = basic( 's3', { /* options*/ }, myHandler ).finally(  after );

        const result = await lambda( require( './s3-put' ), { /*context*/} );

        expect( result ).to.equal( 'HappyFace.jpg' );

        expect( after.calledOnce ).to.be.true;
        expect( after.firstCall.args.length ).to.equal( 1 );
    });

    it( 'fail for unknown type', async function() {

        let myHandler = sinon.stub();

        let after = sinon.stub();

        let lambda = basic( 's3', { /* options*/ }, myHandler ).finally(  after );

        try {

            await lambda( { "Records": [
                    { whatever: {} }
                ]}, { /*context*/} );

            throw new Error( 'should not get here' );
        }
        catch( err ) {

            expect( err.message ).to.contain( 'Expected event type of s3' );

            expect( myHandler.called ).to.be.false;
            expect( after.called ).to.be.false;
        }
    });
});
