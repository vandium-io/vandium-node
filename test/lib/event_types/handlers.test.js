'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const sinon = require( 'sinon' );

const proxyquire = require( 'proxyquire' ).noCallThru();

const helper = require( './helper' );

describe( 'lib/event_types/handlers', function() {

    let handlers;

    let identifierStub;
    let executorsStub;

    beforeEach( function() {

        identifierStub = {

            identify: sinon.stub()
        };

        executorsStub = {

            create: sinon.stub()
        };

        handlers = proxyquire( '../../../lib/event_types/handlers', {

            '@vandium/event-identifier': identifierStub,
            './executors': executorsStub
        });
    });

    describe( '.create', function() {

        it( 'normal operation', function() {

            identifierStub.identify.returns( 'my-type' );
            executorsStub.create.returns( function() { return Promise.resolve( 42 ) } );

            let handler = handlers.create( 'my-type', (event) => {

                expect( event.number ).to.equal( 42 );
            });

            let evt = { whatever: true };

            return helper.asPromise( handler, evt, {} )
                .then( (result) => {

                    expect( result ).to.equal( 42 );
                });
        });
    });
});
