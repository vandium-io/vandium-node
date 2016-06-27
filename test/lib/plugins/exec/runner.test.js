'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const sinon = require( 'sinon' );

const runner = require( '../../../../lib/plugins/exec/runner' );

describe( 'lib/plugins/exec/runner', function() {

    describe( '.install', function() {

        let pipeline;

        beforeEach( function() {

            pipeline = {

                add: sinon.stub()
            };
        });


        it( 'add to pipeline', function() {

            let func = sinon.stub();

            runner.install( pipeline, func );

            expect( pipeline.add.calledOnce ).to.be.true;
            expect( pipeline.add.withArgs( 'exec' ).calledOnce ).to.be.true;

            expect( func.called ).to.be.false;
        });

        it( 'running the handler with callback( null, result )', function() {

            let func = function( event, context, callback ) {

                callback( null, 'ok' );
            };

            runner.install( pipeline, func );

            let pipelineCall = pipeline.add.firstCall.args[1];

            let event = {};
            let context = {};

            let pipelineEvent = { event, context, session: { updateStage: sinon.stub() } };

            let callback = sinon.stub();

            // synchronous
            pipelineCall( pipelineEvent, callback );

            expect( pipelineEvent.session.updateStage.calledOnce ).to.be.true;
            expect( pipelineEvent.session.updateStage.withArgs( 'exec' ).calledOnce ).to.be.true;

            expect( callback.calledOnce ).to.be.true;
            expect( callback.withArgs( null, 'ok' ).calledOnce ).to.be.true;
        });

        it( 'running the handler with callback( err )', function() {

            let func = function( event, context, callback ) {

                callback( new Error( 'bang' ) );
            };

            runner.install( pipeline, func );

            let pipelineCall = pipeline.add.firstCall.args[1];

            let event = {};
            let context = {};

            let pipelineEvent = { event, context, session: { updateStage: sinon.stub() } };

            // synchronous
            pipelineCall( pipelineEvent, function( err, result ) {

                expect( pipelineEvent.session.updateStage.calledOnce ).to.be.true;
                expect( pipelineEvent.session.updateStage.withArgs( 'exec' ).calledOnce ).to.be.true;

                expect( err ).to.exist;
                expect( err.message ).to.equal( 'bang' );

                expect( result ).to.be.undefined;
            });
        });

        it( 'running the handler with callback( string )', function() {

            let func = function( event, context, callback ) {

                callback( 'bang' );
            };

            runner.install( pipeline, func );

            let pipelineCall = pipeline.add.firstCall.args[1];

            let event = {};
            let context = {};

            let pipelineEvent = { event, context, session: { updateStage: sinon.stub() } };

            // synchronous
            pipelineCall( pipelineEvent, function( err, result ) {

                expect( pipelineEvent.session.updateStage.calledOnce ).to.be.true;
                expect( pipelineEvent.session.updateStage.withArgs( 'exec' ).calledOnce ).to.be.true;

                expect( err ).to.exist;
                expect( err ).to.equal( 'bang' );

                expect( result ).to.be.undefined;
            });
        });


        it( 'running the handler returning Promise.resolve()', function( done ) {

            let func = function() {

                return Promise.resolve( 'ok' );
            };

            runner.install( pipeline, func );

            let pipelineCall = pipeline.add.firstCall.args[1];

            let event = {};
            let context = {};

            let pipelineEvent = { event, context, session: { updateStage: sinon.stub() } };

            // synchronous
            pipelineCall( pipelineEvent, function( err, result ) {

                expect( pipelineEvent.session.updateStage.calledOnce ).to.be.true;
                expect( pipelineEvent.session.updateStage.withArgs( 'exec' ).calledOnce ).to.be.true;

                expect( err ).to.be.null;
                expect( result ).to.equal( 'ok' );

                done();
            });
        });

        it( 'running the handler returning Promise.reject()', function( done ) {

            let func = function() {

                return Promise.reject( new Error( 'bang' ) );
            };

            runner.install( pipeline, func );

            let pipelineCall = pipeline.add.firstCall.args[1];

            let event = {};
            let context = {};

            let pipelineEvent = { event, context, session: { updateStage: sinon.stub() } };

            // synchronous
            pipelineCall( pipelineEvent, function( err, result ) {

                expect( pipelineEvent.session.updateStage.calledOnce ).to.be.true;
                expect( pipelineEvent.session.updateStage.withArgs( 'exec' ).calledOnce ).to.be.true;

                expect( err ).to.exist;
                expect( err.message ).to.equal( 'bang' );

                expect( result ).to.be.undefined;

                done();
            });
        });

        it( 'running the handler, synchronous return', function( done ) {

            let func = function() {

                return 'ok';
            };

            runner.install( pipeline, func );

            let pipelineCall = pipeline.add.firstCall.args[1];

            let event = {};
            let context = {};

            let pipelineEvent = { event, context, session: { updateStage: sinon.stub() } };

            // synchronous
            pipelineCall( pipelineEvent, function( err, result ) {

                expect( pipelineEvent.session.updateStage.calledOnce ).to.be.true;
                expect( pipelineEvent.session.updateStage.withArgs( 'exec' ).calledOnce ).to.be.true;

                expect( err ).to.be.null;
                expect( result ).to.equal( 'ok' );

                done();
            });
        });
    });
});
