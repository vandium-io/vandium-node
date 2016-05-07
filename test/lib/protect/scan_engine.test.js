'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const sinon = require( 'sinon' );

const ScanEngine = require( '../../../lib/protect/scan_engine' );

describe( 'lib/protect/scan_engine', function() {

    describe( 'ScanEngine', function() {

        describe( 'constructor', function() {

            it( 'normal operation', function() {

                let engine = new ScanEngine();

                expect( engine.mode ).to.equal( 'report' );
                expect( engine.enabled ).to.be.true;
            });
        });

        describe( '.disable', function() {

            it( 'normal operation', function() {

                let engine = new ScanEngine();

                expect( engine.enabled ).to.be.true;

                let returnValue = engine.disable();

                expect( returnValue ).to.equal( engine );
                expect( engine.enabled ).to.be.false;
            });
        });

        describe( '.report', function() {

            it( 'default case', function() {

                let engine = new ScanEngine();

                expect( engine.enabled ).to.be.true;

                let returnValue = engine.report();

                expect( returnValue ).to.equal( engine );
                expect( engine.mode ).to.equal( 'report' );
                expect( engine.enabled ).to.be.true;
            });

            it( 'after disable()', function() {

                let engine = new ScanEngine().disable().report();

                expect( engine.mode ).to.equal( 'report' );
                expect( engine.enabled ).to.be.true;
            });

            it( 'after fail()', function() {

                let engine = new ScanEngine().fail();

                expect( engine.mode ).to.equal( 'fail' );

                engine.report();

                expect( engine.mode ).to.equal( 'report' );
                expect( engine.enabled ).to.be.true;
            });
        });

        describe( '.fail', function() {

            it( 'default case', function() {

                let engine = new ScanEngine();

                expect( engine.enabled ).to.be.true;

                let returnValue = engine.fail();

                expect( returnValue ).to.equal( engine );
                expect( engine.mode ).to.equal( 'fail' );
                expect( engine.enabled ).to.be.true;
            });

            it( 'after disable()', function() {

                let engine = new ScanEngine().disable().fail();

                expect( engine.mode ).to.equal( 'fail' );
                expect( engine.enabled ).to.be.true;
            });

            it( 'after report()', function() {

                let engine = new ScanEngine().report();

                expect( engine.mode ).to.equal( 'report' );

                engine.fail();

                expect( engine.mode ).to.equal( 'fail' );
                expect( engine.enabled ).to.be.true;
            });
        });

        describe( '.scan', function() {

            it( 'default operaiton', function() {

                let engine = new ScanEngine();

                engine._doScan = sinon.stub();

                let event = {};

                engine.scan( event );

                expect( engine._doScan.calledOnce ).to.be.true;
                expect( engine._doScan.withArgs( event ).calledOnce ).to.be.true;
            });

            it( 'when disabled', function() {

                let engine = new ScanEngine().disable()

                engine._doScan = sinon.stub();

                let event = {};

                engine.scan( event );

                expect( engine._doScan.called ).to.be.false;
            });
        });

        describe( '._doScan', function() {

            it( 'abstract implementation', function() {

                let engine = new ScanEngine();

                expect( engine._doScan.bind( engine, {} ) ).to.throw( 'not implemented' );
            });
        });
    });
});
