'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const proxyquire = require( 'proxyquire' );

const sinon = require( 'sinon' );


describe( 'lib/event_types/typed', function() {

    let TypedHandler;

    let eventIdentifierStub;

    beforeEach( function() {

        eventIdentifierStub = {

            identify: sinon.stub()
        };

        TypedHandler = proxyquire( '../typed', {

            '@vandium/event-identifier': eventIdentifierStub
        })
    });

    describe( 'constructor', function() {

        it( 'normal operation', function() {

            let instance = new TypedHandler( 'my-type', {} );

            expect( instance._type ).to.equal( 'my-type' );
        });
    });

    describe( '.executePreprocessors', function() {

        it( 'matching event type', function() {

            let instance = new TypedHandler( 's3' );

            let state = {

                event: { whatever: true },
                context: {}
            };

            eventIdentifierStub.identify.returns( { type: 's3' } );

            instance.executePreprocessors( state );

            expect( eventIdentifierStub.identify.calledOnce ).to.be.true;
            expect( eventIdentifierStub.identify.firstCall.args ).to.eql( [ state.event ] );
        });

        it( 'non-matching event type', function() {

            let instance = new TypedHandler( 's3' );

            let state = {

                event: { whatever: true },
                context: {}
            };

            eventIdentifierStub.identify.returns( { type: 'sns' } );

            expect( instance.executePreprocessors.bind( instance, state ) ).to.throw( 'Expected event type of s3 but identified as sns' );

            expect( eventIdentifierStub.identify.calledOnce ).to.be.true;
            expect( eventIdentifierStub.identify.firstCall.args ).to.eql( [ state.event ] );
        });
    });
});
