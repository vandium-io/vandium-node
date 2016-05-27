'use strict';

const expect = require( 'chai' ).expect;

const freshy = require( 'freshy' );

const STATE_MODULE_PATH = '../../lib/state';

describe( 'lib/state', function() {

    let state;

    beforeEach( function() {

        freshy.unload( STATE_MODULE_PATH );

        state = require( STATE_MODULE_PATH );
    });

    describe( 'State', function() {

        describe( 'constuctor', function() {

            it( 'singleton instance', function() {

                expect( state.constructor.name ).to.equal( 'State' );
                expect( Object.getOwnPropertyNames( state ) ).to.eql( [ 'current' ] );
            });
        });

        describe( '.recorder', function() {

            it( 'normal operation', function() {

                let recorder = state.recorder( 'test' );

                expect( recorder.constructor.name ).to.equal( 'Recorder' );
            });
        });

        describe( '.record', function() {

            it( 'normal operation - no delimeter', function() {

                state.record( 'test', { one: 1 } );

                expect( state.current ).to.eql( { test: { one: 1 } } );
            });

            it( 'normal operation - with delimeter', function() {

                state.record( 'test.sub', { one: 1 } );

                expect( state.current ).to.eql( { test: { sub: { one: 1 } } } );
            });
        });

        describe( '.current', function() {

            it( 'verify snapshot', function() {

                state.record( 'test', { one: 1 } );

                let snapshot = state.current;

                expect( snapshot ).to.eql( { test: { one: 1 } } );

                // update state
                state.record( 'test', { one: 'one' } );
                expect( state.current ).to.eql( { test: { one: 'one' } } );

                // should still be same as before
                expect( snapshot ).to.eql( { test: { one: 1 } } );
            });
        });
    });

    describe( 'Recorder', function() {

        describe( 'constructor', function() {

            it( 'no delimeter', function() {

                let recorder = state.recorder( 'test' );

                expect( recorder.constructor.name ).to.equal( 'Recorder' );
                expect( recorder.pathParts ).to.eql( [ 'test' ] );
            });

            it( 'with delimeter', function() {

                let recorder = state.recorder( 'test.one.two.three' );

                expect( recorder.constructor.name ).to.equal( 'Recorder' );
                expect( recorder.pathParts ).to.eql( [ 'test', 'one', 'two', 'three' ] );
            });
        });

        describe( '.record', function() {

            it( 'no delimeter, valid value, no previous state', function() {

                let recorder = state.recorder( 'test' );

                recorder.record( { one: 1 } );
                expect( state.current ).to.eql( { test: { one: 1 } } );
            });

            it( 'no delimeter, valid value, previous state', function() {

                let recorder = state.recorder( 'test' );

                recorder.record( { one: 1 } );
                expect( state.current ).to.eql( { test: { one: 1 } } );

                recorder.record( { one: 'one' } );
                expect( state.current ).to.eql( { test: { one: 'one' } } );
            });

            it( 'no delimeter, empty value, no previous state', function() {

                let recorder = state.recorder( 'test' );

                recorder.record( null );
                expect( state.current ).to.eql( { } );
            });

            it( 'no delimeter, empty value, previous state', function() {

                let recorder = state.recorder( 'test' );

                recorder.record( { one: 1 } );
                expect( state.current ).to.eql( { test: { one: 1 } } );

                recorder.record( null );
                expect( state.current ).to.eql( { } );
            });

            it( 'with delimeter, valid value, with empty parent state', function() {

                let recorder = state.recorder( 'test.sub' );

                recorder.record( { one: 1 } );
                expect( state.current ).to.eql( { test: { sub: { one: 1 } } } );
            });

            it( 'with delimeter, valid value, with existing parent state', function() {

                state.record( 'test', { one: 1 } );
                expect( state.current ).to.eql( { test: { one: 1 } } );

                let recorder = state.recorder( 'test.sub' );

                recorder.record( { one_sub: 'one' } );
                expect( state.current ).to.eql( { test: { one: 1, sub: { one_sub: 'one' } } } );
            });

            it( 'with delimeter, empty value, with empty parent state', function() {

                let recorder = state.recorder( 'test.sub' );

                recorder.record( null );
                expect( state.current ).to.eql( { } );
            });

            it( 'with delimeter, empty value, with existing parent state', function() {

                state.record( 'test', { one: 1 } );
                expect( state.current ).to.eql( { test: { one: 1 } } );

                let recorder = state.recorder( 'test.sub' );

                recorder.record( null );
                expect( state.current ).to.eql( { test: { one: 1 } } );
            });
        });
    });
});
