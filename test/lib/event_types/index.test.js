'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const sinon = require( 'sinon' );

const proxyquire = require( 'proxyquire' ).noCallThru();

describe( 'lib/event_types/index', function() {

    let eventTypes;

    let handlersStub;

    beforeEach( function() {

        handlersStub = {

            create: sinon.stub()
        };

        eventTypes = proxyquire( '../../../lib/event_types/index', {

            './handlers': handlersStub
        });
    });

    describe( '.api', function() {

        it( 'normal operation', function() {

            let api = require( '../../../lib/event_types/api' );

            expect( eventTypes.api ).to.equal( api );

            expect( handlersStub.create.called ).to.be.false;
        });
    });

    // record types
    [
        's3',
        'dynamodb',
        'sns',
        'ses',
        'kinesis'

    ].forEach( ( type ) => {
        describe( `.${type}`, function() {

            it( 'normal operation', function() {

                let mockHandler = function() {};

                let myHandler = function( event ) {};

                handlersStub.create.returns( mockHandler );

                let lambda = eventTypes[type]( myHandler );

                expect( lambda ).to.equal( mockHandler );

                expect( handlersStub.create.calledOnce ).to.be.true;
                expect( handlersStub.create.firstCall.args[0] ).to.equal( type );
                expect( handlersStub.create.firstCall.args[1] ).to.equal( myHandler );
                expect( handlersStub.create.firstCall.args[2] ).to.exist;
            });
        });
    });
});
