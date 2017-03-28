'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const sinon = require( 'sinon' );

const MODULE_PATH = 'lib/plugins/protect/scan_engine';

const ScanEngine = require( '../../../../' + MODULE_PATH );

const Scanner = require( '../../../../lib/protect/scanner' );

describe( MODULE_PATH, function() {

    describe( 'ScanEngine', function() {

        let scanner;

        beforeEach( function() {

            scanner = new Scanner();
        });

        describe( 'constructor', function() {

            it( 'normal operation', function() {

                let engine = new ScanEngine( 'test', scanner );

                expect( engine.name ).to.equal( 'protect_test' );

                expect( engine.state ).to.eql( { enabled: true, mode: 'report', lambdaProxy: false } );
            });
        });

        describe( '.disable', function() {

            it( 'normal operation', function() {

                let engine = new ScanEngine( 'test', scanner );

                expect( engine.state ).to.eql( { enabled: true, mode: 'report', lambdaProxy: false } );

                let returnValue = engine.disable();

                expect( returnValue ).to.equal( engine );

                expect( engine.state ).to.eql( { enabled: false } );
            });
        });

        describe( '.report', function() {

            it( 'default case', function() {

                let engine = new ScanEngine( 'test', scanner );

                let returnValue = engine.report();

                expect( returnValue ).to.equal( engine );

                expect( engine.state ).to.eql( { enabled: true, mode: 'report', lambdaProxy: false } );
            });

            it( 'after disable()', function() {

                let engine = new ScanEngine( 'test', scanner ).disable().report();

                expect( engine.state ).to.eql( { enabled: true, mode: 'report', lambdaProxy: false } );
            });

            it( 'after fail()', function() {

                let engine = new ScanEngine( 'test', scanner ).fail();

                engine.report();

                expect( engine.state ).to.eql( { enabled: true, mode: 'report', lambdaProxy: false } );
            });
        });

        describe( '.fail', function() {

            it( 'default case', function() {

                let engine = new ScanEngine( 'test', scanner );

                let returnValue = engine.fail();

                expect( returnValue ).to.equal( engine );

                expect( engine.state ).to.eql( { enabled: true, mode: 'fail', lambdaProxy: false } );
            });

            it( 'after disable()', function() {

                let engine = new ScanEngine( 'test', scanner ).disable().fail();

                expect( engine.state ).to.eql( { enabled: true, mode: 'fail', lambdaProxy: false } );
            });

            it( 'after report()', function() {

                let engine = new ScanEngine( 'test', scanner ).report();

                engine.fail();

                expect( engine.state ).to.eql( { enabled: true, mode: 'fail', lambdaProxy: false } );
            });
        });

        describe( '.execute', function() {

            it( 'default operation', function( done ) {

                let engine = new ScanEngine( 'test', scanner );

                let event = { one: 1 };

                let scanSpy = sinon.spy( scanner, 'scan' );

                engine.execute( { event }, function( err ) {

                    try {

                        expect( err ).to.not.exist;

                        expect( scanSpy.calledOnce ).to.be.true;
                        expect( scanSpy.withArgs( event ).calledOnce ).to.be.true;

                        done();
                    }
                    catch( err ) {

                        done( err );
                    }
                });
            });

            it( 'lambdaProxy enabled', function( done ) {

                let engine = new ScanEngine( 'test', scanner );

                engine.enableLambdaProxy( true );

                expect( engine.lambdaProxy ).to.be.true;

                engine._doScan = sinon.stub();

                let event = { one: 1, body: { two: 2 }, queryStringParameters: { three: 3 } };

                let scanSpy = sinon.spy( scanner, 'scan' );

                engine.execute( { event }, function( err ) {

                    try {

                        expect( err ).to.not.exist;

                        expect( scanSpy.calledTwice ).to.be.true;
                        expect( scanSpy.withArgs( event.body ).calledOnce ).to.be.true;
                        expect( scanSpy.withArgs( event.queryStringParameters ).calledOnce ).to.be.true;

                        done();
                    }
                    catch( err ) {

                        done( err );
                    }
                });
            });

            it( 'when disabled', function( done ) {

                let engine = new ScanEngine( 'test', scanner ).disable()

                engine._doScan = sinon.stub();

                let event = {};

                let scanSpy = sinon.spy( scanner, 'scan' );

                engine.execute( event, function( err ) {

                    try {

                        expect( err ).to.not.exist;

                        expect( scanSpy.called ).to.be.false;

                        done();
                    }
                    catch( err ) {

                        done( err );
                    }
                });
            });

            it( 'fail: when _doScan throws an error', function( done ) {

                let engine = new ScanEngine( 'test', scanner );

                scanner.scan = sinon.stub().throws( new Error( 'bang' ) );

                let event = {};

                engine.execute( event, function( err ) {

                    try {

                        expect( err ).to.exist;

                        expect( err ).to.exist;
                        expect( err.message ).to.equal( 'bang' );

                        done();
                    }
                    catch( err ) {

                        done( err );
                    }
                });
            });
        });

        describe( '.configure', function() {

            it( 'empty configuration - default state', function() {

                let engine = new ScanEngine( 'test', scanner );

                engine.configure( { } );

                expect( engine.state.mode ).to.equal( 'report' );
            });

            it( 'empty configuration - from state other than report', function() {

                let engine = new ScanEngine( 'test', scanner ).fail();

                expect( engine.state.mode ).to.equal( 'fail' );

                engine.configure( { } );

                expect( engine.state.mode ).to.equal( 'report' );
            });

            it( 'config.mode = report', function() {

                let engine = new ScanEngine( 'test', scanner ).fail();

                expect( engine.state.mode ).to.equal( 'fail' );

                engine.configure( { mode: 'report' } );

                expect( engine.state.mode ).to.equal( 'report' );
            });

            it( 'config.mode = fail', function() {

                let engine = new ScanEngine( 'test', scanner );

                expect( engine.state.mode ).to.equal( 'report' );

                engine.configure( { mode: 'fail' } );

                expect( engine.state.mode ).to.equal( 'fail' );
            });

            it( 'config.mode = unknown', function() {

                let engine = new ScanEngine( 'test', scanner ).fail();

                expect( engine.state.mode ).to.equal( 'fail' );

                engine.configure( { mode: 'unknown' } );

                expect( engine.state.mode ).to.equal( 'fail' );
            });

            it( 'config.mode = disabled', function() {

                let engine = new ScanEngine( 'test', scanner ).fail();

                expect( engine.state.mode ).to.equal( 'fail' );

                engine.configure( { mode: 'disabled' } );

                expect( engine.state.enabled ).to.be.false;
            });
        });
    });
});
