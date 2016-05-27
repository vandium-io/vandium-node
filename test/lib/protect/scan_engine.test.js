'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const sinon = require( 'sinon' );

const SCAN_ENGINE_MODULE_PATH = '../../../lib/protect/scan_engine';

const state = require( '../../../lib/state' );

describe( 'lib/protect/scan_engine', function() {

    let ScanEngine = require( SCAN_ENGINE_MODULE_PATH );

    after( function() {

        state.record( 'protect.test' );
    });

    describe( 'ScanEngine', function() {

        describe( 'constructor', function() {

            it( 'normal operation', function() {

                let engine = new ScanEngine( 'test' );

                expect( engine.name ).to.equal( 'test' );
                expect( engine.mode ).to.equal( 'report' );
                expect( engine.enabled ).to.be.true;

                expect( state.current.protect.test ).to.eql( { enabled: true, mode: 'report' } );
            });
        });

        describe( '.disable', function() {

            it( 'normal operation', function() {

                let engine = new ScanEngine( 'test' );

                expect( engine.enabled ).to.be.true;

                let returnValue = engine.disable();

                expect( returnValue ).to.equal( engine );
                expect( engine.enabled ).to.be.false;

                expect( state.current.protect.test ).to.eql( { enabled: false, mode: 'report' } );
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
            });

            it( 'after disable()', function() {

                let engine = new ScanEngine( 'test' ).disable().report();

                expect( engine.mode ).to.equal( 'report' );
                expect( engine.enabled ).to.be.true;
            });

            it( 'after fail()', function() {

                let engine = new ScanEngine( 'test' ).fail();

                expect( engine.mode ).to.equal( 'fail' );

                engine.report();

                expect( engine.mode ).to.equal( 'report' );
                expect( engine.enabled ).to.be.true;
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
            });

            it( 'after disable()', function() {

                let engine = new ScanEngine( 'test' ).disable().fail();

                expect( engine.mode ).to.equal( 'fail' );
                expect( engine.enabled ).to.be.true;
            });

            it( 'after report()', function() {

                let engine = new ScanEngine( 'test' ).report();

                expect( engine.mode ).to.equal( 'report' );

                engine.fail();

                expect( engine.mode ).to.equal( 'fail' );
                expect( engine.enabled ).to.be.true;
            });
        });

        describe( '.scan', function() {

            it( 'default operaiton', function() {

                let engine = new ScanEngine( 'test' );

                engine._doScan = sinon.stub();

                let event = {};

                engine.scan( event );

                expect( engine._doScan.calledOnce ).to.be.true;
                expect( engine._doScan.withArgs( event ).calledOnce ).to.be.true;
            });

            it( 'when disabled', function() {

                let engine = new ScanEngine( 'test' ).disable()

                engine._doScan = sinon.stub();

                let event = {};

                engine.scan( event );

                expect( engine._doScan.called ).to.be.false;
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
