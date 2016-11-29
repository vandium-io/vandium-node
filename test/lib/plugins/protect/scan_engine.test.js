'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const sinon = require( 'sinon' );

const MODULE_PATH = 'lib/plugins/protect/scan_engine';

const ScanEngine = require( '../../../../' + MODULE_PATH );

describe( MODULE_PATH, function() {

    describe( 'ScanEngine', function() {

        describe( 'constructor', function() {

            it( 'normal operation', function() {

                let engine = new ScanEngine( 'test' );

                expect( engine.name ).to.equal( 'protect_test' );
                expect( engine.mode ).to.equal( 'report' );
                expect( engine.enabled ).to.be.true;

                expect( engine.state ).to.eql( { enabled: true, mode: 'report', lambdaProxy: false } );
            });
        });

        describe( '.disable', function() {

            it( 'normal operation', function() {

                let engine = new ScanEngine( 'test' );

                expect( engine.enabled ).to.be.true;

                let returnValue = engine.disable();

                expect( returnValue ).to.equal( engine );
                expect( engine.enabled ).to.be.false;

                expect( engine.state ).to.eql( { enabled: false } );
            });
        });

        describe( '.report', function() {

            it( 'default case', function() {

                let engine = new ScanEngine( 'test' );

                expect( engine.enabled ).to.be.true;

                let returnValue = engine.report();

                expect( returnValue ).to.equal( engine );
                expect( engine.mode ).to.equal( 'report' );
                expect( engine.enabled ).to.be.true;

                expect( engine.state ).to.eql( { enabled: true, mode: 'report', lambdaProxy: false } );
            });

            it( 'after disable()', function() {

                let engine = new ScanEngine( 'test' ).disable().report();

                expect( engine.mode ).to.equal( 'report' );
                expect( engine.enabled ).to.be.true;

                expect( engine.state ).to.eql( { enabled: true, mode: 'report', lambdaProxy: false } );
            });

            it( 'after fail()', function() {

                let engine = new ScanEngine( 'test' ).fail();

                expect( engine.mode ).to.equal( 'fail' );

                engine.report();

                expect( engine.mode ).to.equal( 'report' );
                expect( engine.enabled ).to.be.true;

                expect( engine.state ).to.eql( { enabled: true, mode: 'report', lambdaProxy: false } );
            });
        });

        describe( '.fail', function() {

            it( 'default case', function() {

                let engine = new ScanEngine( 'test' );

                expect( engine.enabled ).to.be.true;

                let returnValue = engine.fail();

                expect( returnValue ).to.equal( engine );
                expect( engine.mode ).to.equal( 'fail' );
                expect( engine.enabled ).to.be.true;

                expect( engine.state ).to.eql( { enabled: true, mode: 'fail', lambdaProxy: false } );
            });

            it( 'after disable()', function() {

                let engine = new ScanEngine( 'test' ).disable().fail();

                expect( engine.mode ).to.equal( 'fail' );
                expect( engine.enabled ).to.be.true;

                expect( engine.state ).to.eql( { enabled: true, mode: 'fail', lambdaProxy: false } );
            });

            it( 'after report()', function() {

                let engine = new ScanEngine( 'test' ).report();

                expect( engine.mode ).to.equal( 'report' );

                engine.fail();

                expect( engine.mode ).to.equal( 'fail' );
                expect( engine.enabled ).to.be.true;

                expect( engine.state ).to.eql( { enabled: true, mode: 'fail', lambdaProxy: false } );
            });
        });

        describe( '.execute', function() {

            it( 'default operation', function( done ) {

                let engine = new ScanEngine( 'test' );

                engine._doScan = sinon.stub();

                let event = { one: 1 };

                engine.execute( { event }, function( err ) {

                    expect( engine._doScan.calledOnce ).to.be.true;
                    expect( engine._doScan.withArgs( event ).calledOnce ).to.be.true;

                    done( err );
                });
            });

            it( 'lambdaProxy enabled', function( done ) {

                let engine = new ScanEngine( 'test' );

                engine.enableLambdaProxy( true );

                expect( engine.lambdaProxy ).to.be.true;

                engine._doScan = sinon.stub();

                let event = { one: 1, body: {}, queryStringParameters: {} };

                engine.execute( { event }, function( err ) {

                    expect( engine._doScan.calledOnce ).to.be.true;
                    expect( engine._doScan.withArgs( event ).calledOnce ).to.be.true;

                    let filter = engine._doScan.firstCall.args[ 1 ];

                    expect( filter.name ).to.equal( 'lambdaProxyFilter' );

                    expect( filter( 'body' ) ).to.be.true;
                    expect( filter( 'queryStringParameters' ) ).to.be.true;

                    expect( filter( 'headers' ) ).to.be.false;
                    expect( filter( 'whatever' ) ).to.be.false;

                    done( err );
                });
            });

            it( 'when disabled', function( done ) {

                let engine = new ScanEngine( 'test' ).disable()

                engine._doScan = sinon.stub();

                let event = {};

                engine.execute( event, function( err ) {

                    expect( engine._doScan.called ).to.be.false;

                    done( err );
                });
            });

            it( 'fail: when _doScan throws an error', function( done ) {

                let engine = new ScanEngine( 'test' );

                engine._doScan = sinon.stub().throws( new Error( 'bang' ) );

                let event = {};

                engine.execute( event, function( err ) {

                    expect( err ).to.exist;
                    expect( err.message ).to.equal( 'bang' );

                    done();
                });
            });
        });

        describe( '.configure', function() {

            it( 'empty configuration - default state', function() {

                let engine = new ScanEngine( 'test' );

                engine.configure( { } );

                expect( engine.state.mode ).to.equal( 'report' );
            });

            it( 'empty configuration - from state other than report', function() {

                let engine = new ScanEngine( 'test' ).fail();

                expect( engine.state.mode ).to.equal( 'fail' );

                engine.configure( { } );

                expect( engine.state.mode ).to.equal( 'report' );
            });

            it( 'config.mode = report', function() {

                let engine = new ScanEngine( 'test' ).fail();

                expect( engine.state.mode ).to.equal( 'fail' );

                engine.configure( { mode: 'report' } );

                expect( engine.state.mode ).to.equal( 'report' );
            });

            it( 'config.mode = fail', function() {

                let engine = new ScanEngine( 'test' );

                expect( engine.state.mode ).to.equal( 'report' );

                engine.configure( { mode: 'fail' } );

                expect( engine.state.mode ).to.equal( 'fail' );
            });

            it( 'config.mode = unknown', function() {

                let engine = new ScanEngine( 'test' ).fail();

                expect( engine.state.mode ).to.equal( 'fail' );

                engine.configure( { mode: 'unknown' } );

                expect( engine.state.mode ).to.equal( 'fail' );
            });

            it( 'config.mode = disabled', function() {

                let engine = new ScanEngine( 'test' ).fail();

                expect( engine.state.mode ).to.equal( 'fail' );

                engine.configure( { mode: 'disabled' } );

                expect( engine.state.enabled ).to.be.false;
            });
        });

        describe( '._doScan', function() {

            it( 'abstract implementation', function() {

                let engine = new ScanEngine( 'test' );

                expect( engine._doScan.bind( engine, {} ) ).to.throw( 'not implemented' );
            });
        });
    });
});
