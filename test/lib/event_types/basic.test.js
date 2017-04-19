'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const sinon = require( 'sinon' );

const basic = require( '../../../lib/event_types/basic' );

describe( 'lib/event_types/basic', function() {

    it( 'normal operation, no options, no callback, no finally', function( done ) {

        let myHandler = function( event ) {

                    return event.Records[0].s3.object.key;
                };

        let lambda = basic( 's3', myHandler );

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

        let myHandler = function( event ) {

                    return event.Records[0].s3.object.key;
                };

        let lambda = basic( 's3', { /* options*/ }, myHandler );

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

        let myHandler = function( event ) {

                    return event.Records[0].s3.object.key;
                };

        let lambda = basic( 's3', { /* options*/ }, myHandler );

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

        let myHandler = function( event, context, callback ) {

                    callback( null, event.Records[0].s3.object.key );
                };

        let after = sinon.stub();

        let lambda = basic( 's3', { /* options*/ }, myHandler ).finally(  after );

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

    it( 'fail for unknown type', function( done ) {

        let myHandler = sinon.stub();

        let after = sinon.stub();

        let lambda = basic( 's3', { /* options*/ }, myHandler ).finally(  after );

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
