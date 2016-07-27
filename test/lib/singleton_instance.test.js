'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const proxyquire = require( 'proxyquire' ).noCallThru();

const sinon = require( 'sinon' );

const MODULE_PATH =  'lib/singleton_instance';

describe( MODULE_PATH, function() {

    let singleton;

    let configStub;

    beforeEach( function() {

        configStub = {

            load: sinon.stub(),

            isLoaded: sinon.stub().returns( true ),

            get: sinon.stub().returns( {} ),

            on: sinon.stub()
        };

        let configStubModule = {

            create: sinon.stub().returns( configStub )
        };

        singleton = proxyquire( '../../' + MODULE_PATH, {

                './config': configStubModule
            });
    });

    describe( '.get', function() {

        it( 'normal operation', function() {

            let instance = singleton.get();

            // should be cached
            expect( singleton.get() ).to.equal( instance );

            expect( configStub.load.calledOnce ).to.be.true;
            expect( configStub.load.withArgs().calledOnce ).to.be.true;

            expect( configStub.get.calledOnce ).to.be.true;
            expect( configStub.get.withArgs().calledOnce ).to.be.true;

            expect( configStub.isLoaded.calledOnce ).to.be.true;
            expect( configStub.isLoaded.withArgs().calledOnce ).to.be.true;
        });

        it( 'normal operation, deferred load via s3', function() {

            configStub.isLoaded.returns( false );

            let instance = singleton.get();

            // should be cached
            expect( singleton.get() ).to.equal( instance );

            expect( configStub.load.calledOnce ).to.be.true;
            expect( configStub.load.withArgs().calledOnce ).to.be.true;

            expect( configStub.get.calledOnce ).to.be.true;
            expect( configStub.get.withArgs().calledOnce ).to.be.true;

            expect( configStub.isLoaded.calledOnce ).to.be.true;
            expect( configStub.isLoaded.withArgs().calledOnce ).to.be.true;

            expect( configStub.on.calledOnce ).to.be.true;
            expect( configStub.on.withArgs( 'update' ).calledOnce ).to.be.true;

            // invoke callback
            configStub.on.firstCall.args[ 1 ]();

            expect( configStub.get.calledTwice ).to.be.true;
            expect( configStub.get.withArgs().calledTwice ).to.be.true;
        });
    });

    describe( '.reset', function() {

        it( 'normal operation', function() {

            let instance = singleton.get();

            // should be cached
            expect( singleton.get() ).to.equal( instance );

            singleton.reset();

            expect( singleton.get() ).to.not.equal( instance );

            expect( configStub.load.calledTwice ).to.be.true;
            expect( configStub.load.withArgs().calledTwice ).to.be.true;

            expect( configStub.get.calledTwice ).to.be.true;
            expect( configStub.get.withArgs().calledTwice ).to.be.true;

            expect( configStub.isLoaded.calledTwice ).to.be.true;
            expect( configStub.isLoaded.withArgs().calledTwice ).to.be.true;
        });
    });
});
