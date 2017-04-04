'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const sinon = require( 'sinon' );

const proxyquire = require( 'proxyquire' ).noCallThru();

const helper = require( './helper' );

describe( 'lib/event_types/record', function() {

    let createHandler;

    let identifierStub;
    let executorsStub;

    beforeEach( function() {

        identifierStub = {

            identify: sinon.stub()
        };

        executorsStub = {

            create: sinon.stub()
        };

        createHandler = proxyquire( '../../../lib/event_types/record', {

            '@vandium/event-identifier': identifierStub,
            './executors': executorsStub
        });
    });

    describe( '.createHandler', function() {

        it( 'normal operation', function() {

            identifierStub.identify.returns( 's3' );
            executorsStub.create.returns( function() { return Promise.resolve( 42 ) } );

            let handler = createHandler( 's3', (event) => {} );

            let evt = require( './s3-put.json' );

            return helper.asPromise( handler, evt, {} );
        });
    });
});
