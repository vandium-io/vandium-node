'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const sinon = require( 'sinon' );

const Pipeline = require( '../../lib/pipeline' );

describe( 'lib/pipeline', function() {

    describe( 'Pipeline', function() {

        describe( 'constructor', function() {

            it( 'normal operation', function() {

                let instance = new Pipeline();

                expect( instance.constructor.name ).to.equal( 'Pipeline' );
                expect( instance ).to.eql( { handlers: {} } );
            });
        });

        describe( '.add', function() {

            [
                undefined,
                '$head',
                '$Head',
                '$tail',
                '$Tail'
            ].forEach( function( location ) {

                let before = [ undefined, true, false ];

                for( let b of before ) {

                    it( 'empty pipeline, location: ' + location + ', before: ' + b, function() {

                        let instance = new Pipeline();

                        let handler = function( event, cb ) { cb(); };

                        let retValue = instance.add( 'My handler', handler, location, b );

                        expect( retValue ).to.equal( instance );

                        expect( instance.handlers[ 'my handler' ] ).to.exist;
                        expect( instance.handlers[ 'my handler' ].handler ).to.equal( handler );
                        expect( instance.handlers[ 'my handler' ].prev ).to.not.exist;
                        expect( instance.handlers[ 'my handler' ].next ).to.not.exist;

                        expect( instance.head ).to.exist;
                        expect( instance.head ).to.equal( instance.handlers[ 'my handler' ] );
                    });
                }
            });

            it( 'existing pipeline, before $head', function() {

                let instance = new Pipeline();

                let handler1 = function( event, cb ) { cb(); };
                let handler2 = function( event, cb ) { cb(); };

                let retValue = instance.add( 'first', handler1 )
                                       .add( 'second', handler2, '$head', true );

                expect( retValue ).to.equal( instance );

                expect( instance.head.name ).to.equal( 'second' );
                expect( instance.head.next ).to.equal( instance.handlers.first );
                expect( instance.head.prev ).to.not.exist;
                expect( instance.head.handler ).to.equal( handler2 );
                expect( instance.head.next.prev ).to.equal( instance.head );
            });

            it( 'existing pipeline, after $head', function() {

                let instance = new Pipeline();

                let handler1 = function( event, cb ) { cb(); };
                let handler2 = function( event, cb ) { cb(); };

                let retValue = instance.add( 'first', handler1 )
                                       .add( 'second', handler2, '$head' /*,false*/ );

                expect( retValue ).to.equal( instance );

                expect( instance.head.name ).to.equal( 'first' );
                expect( instance.head.next ).to.equal( instance.handlers.second );
                expect( instance.handlers.second.handler ).to.equal( handler2 );
                expect( instance.handlers.second.prev ).to.equal( instance.head );
            });

            it( 'add handlers before and after', function() {

                let instance = new Pipeline();

                instance.add( '2', function() {} );
                instance.add( '1', function() {}, '2', true );
                instance.add( '4', function() {}, '2' );
                instance.add( '3', function() {}, '4', true );
                instance.add( '6', function() {} );
                instance.add( '5', function() {}, '4' );

                expect( instance.head.name ).to.equal( '1' );
                expect( instance.head.prev ).to.not.exit;
                expect( instance.head.next ).to.equal( instance.handlers[2] );

                expect( instance.head.next.name ).to.equal( '2' );
                expect( instance.head.next.prev ).to.equal( instance.head );
                expect( instance.head.next.next ).to.equal( instance.handlers[3] );

                expect( instance.head.next.next.name ).to.equal( '3' );
                expect( instance.head.next.next.prev ).to.equal( instance.handlers[2] );
                expect( instance.head.next.next.next ).to.equal( instance.handlers[4] );

                expect( instance.head.next.next.next.name ).to.equal( '4' );
                expect( instance.head.next.next.next.prev ).to.equal( instance.handlers[3] );
                expect( instance.head.next.next.next.next ).to.equal( instance.handlers[5] );

                expect( instance.head.next.next.next.next.name ).to.equal( '5' );
                expect( instance.head.next.next.next.next.prev ).to.equal( instance.handlers[4] );
                expect( instance.head.next.next.next.next.next ).to.equal( instance.handlers[6] );

                expect( instance.head.next.next.next.next.next.name ).to.equal( '6' );
                expect( instance.head.next.next.next.next.next.prev ).to.equal( instance.handlers[5] );
                expect( instance.head.next.next.next.next.next.next ).to.not.exist;
            });

            it( 'fail: when handler name is missing', function() {

                let instance = new Pipeline();

                expect( instance.add.bind( instance, null, function() {} ) ).to.throw( 'missing name' );
            });

            it( 'fail: when handler is missing', function() {

                let instance = new Pipeline();

                expect( instance.add.bind( instance, 'start' ) ).to.throw( 'missing handler' );
            });

            it( 'fail: when handler is not a function', function() {

                let instance = new Pipeline();

                expect( instance.add.bind( instance, 'start', 'my-handler!!!' ) ).to.throw( 'invalid handler' );
            });

            it( 'fail: when handler aleady exists', function() {

                let instance = new Pipeline();

                instance.add( 'start', function() {} );
                expect( instance.add.bind( instance, 'start', function() {} ) ).to.throw( 'handler already exists with name: start' );
            });

            it( 'fail: when insert location is not known', function() {

                let instance = new Pipeline();

                expect( instance.add.bind( instance, 'start', function() {}, 'My-location' ) ).to.throw( 'cannot find location: My-location' );
            });
        });

        describe( '.run', function() {

            let handler1;
            let handler2;
            let handler3;

            beforeEach( function() {

                handler1 = sinon.stub();
                handler2 = sinon.stub();
                handler3 = sinon.stub();
            })

            it( 'simple run with 1 handler', function() {

                let instance = new Pipeline();

                instance.add( 'start', handler1.yieldsAsync( null, 1 ) );

                let myEvent = { one: 1 };

                return instance.run( myEvent )
                    .then( function( results ) {

                        expect( results ).to.eql( { start: 1 } );

                        expect( handler1.calledOnce ).to.be.true;
                        expect( handler1.withArgs( myEvent ).calledOnce ).to.be.true;
                    });
            });

            it( 'simple run with several handlers (async)', function() {

                let instance = new Pipeline();

                instance.add( 'start', handler1.yieldsAsync( null, 1 ) );
                instance.add( 'middle', handler2.yieldsAsync( null, 2 ) );
                instance.add( 'end', handler3.yieldsAsync( null, 3 ) );

                let myEvent = { one: 1 };

                return instance.run( myEvent )
                    .then( function( results ) {

                        expect( results ).to.eql( { start: 1, middle: 2, end: 3 } );

                        expect( handler1.calledOnce ).to.be.true;
                        expect( handler1.withArgs( myEvent ).calledOnce ).to.be.true;

                        expect( handler2.calledOnce ).to.be.true;
                        expect( handler2.withArgs( myEvent ).calledOnce ).to.be.true;

                        expect( handler3.calledOnce ).to.be.true;
                        expect( handler3.withArgs( myEvent ).calledOnce ).to.be.true;
                    });
            });

            it( 'simple run with several handlers (sync)', function() {

                let instance = new Pipeline();

                instance.add( 'start', handler1.yields( null, 1 ) );
                instance.add( 'middle', handler2.yields( null, 2 ) );
                instance.add( 'end', handler3.yields( null, 3 ) );

                let myEvent = { one: 1 };

                return instance.run( myEvent )
                    .then( function( results ) {

                        expect( results ).to.eql( { start: 1, middle: 2, end: 3 } );

                        expect( handler1.calledOnce ).to.be.true;
                        expect( handler1.withArgs( myEvent ).calledOnce ).to.be.true;

                        expect( handler2.calledOnce ).to.be.true;
                        expect( handler2.withArgs( myEvent ).calledOnce ).to.be.true;

                        expect( handler3.calledOnce ).to.be.true;
                        expect( handler3.withArgs( myEvent ).calledOnce ).to.be.true;
                    });
            });

            it( 'simple run with several handlers using Promises', function() {

                let instance = new Pipeline();

                instance.add( 'start', handler1.yieldsAsync( null, 1 ) );
                instance.add( 'middle', handler2.returns( Promise.resolve( 2) ), 'start' );
                instance.add( 'end', handler3.yieldsAsync( null, 3 ), '$tail' );

                let myEvent = { one: 1 };

                return instance.run( myEvent )
                    .then( function( results ) {

                        expect( results ).to.eql( { start: 1, middle: 2, end: 3 } );

                        expect( handler1.calledOnce ).to.be.true;
                        expect( handler1.withArgs( myEvent ).calledOnce ).to.be.true;

                        expect( handler2.calledOnce ).to.be.true;
                        expect( handler2.withArgs( myEvent ).calledOnce ).to.be.true;

                        expect( handler3.calledOnce ).to.be.true;
                        expect( handler3.withArgs( myEvent ).calledOnce ).to.be.true;
                    });
            });

            it( 'exception during pipeline', function() {

                let instance = new Pipeline();

                instance.add( 'start', handler1.yieldsAsync( null, 1 ) );
                instance.add( 'middle', handler2.yieldsAsync( new Error( 'bang' ) ) );
                instance.add( 'end', handler3 );

                let myEvent = { one: 1 };

                return instance.run( myEvent )
                    .then(
                        function() {

                            throw new Error( 'should not complete the pipeline' );
                        },

                        function( err ) {

                            expect( err.message ).to.equal( 'bang' );

                            expect( handler1.calledOnce ).to.be.true;
                            expect( handler1.withArgs( myEvent ).calledOnce ).to.be.true;

                            expect( handler2.calledOnce ).to.be.true;
                            expect( handler2.withArgs( myEvent ).calledOnce ).to.be.true;

                            expect( handler3.called ).to.be.false;
                        }
                    );
            });

            it( 'exception at start of pipeline', function() {

                let instance = new Pipeline();

                instance.add( 'start', handler1.yieldsAsync( new Error( 'bang' ), 1 ) );
                instance.add( 'middle', handler2 );
                instance.add( 'end', handler3 );

                let myEvent = { one: 1 };

                return instance.run( myEvent )
                    .then(
                        function() {

                            throw new Error( 'should not complete the pipeline' );
                        },

                        function( err ) {

                            expect( err.message ).to.equal( 'bang' );

                            expect( handler1.calledOnce ).to.be.true;
                            expect( handler1.withArgs( myEvent ).calledOnce ).to.be.true;

                            expect( handler2.called ).to.be.false;
                            expect( handler3.called ).to.be.false;
                        }
                    );
            });

            it( 'exception at end of pipeline', function() {

                let instance = new Pipeline();

                instance.add( 'start', handler1.yieldsAsync( null, 1 ) );
                instance.add( 'middle', handler2.yieldsAsync( null, 2 ) );
                instance.add( 'end', handler3.yieldsAsync( new Error( 'bang' ) ) );

                let myEvent = { one: 1 };

                return instance.run( myEvent )
                    .then(
                        function() {

                            throw new Error( 'should not complete the pipeline' );
                        },

                        function( err ) {

                            expect( err.message ).to.equal( 'bang' );

                            expect( handler1.calledOnce ).to.be.true;
                            expect( handler1.withArgs( myEvent ).calledOnce ).to.be.true;

                            expect( handler2.calledOnce ).to.be.true;
                            expect( handler2.withArgs( myEvent ).calledOnce ).to.be.true;

                            expect( handler3.calledOnce ).to.be.true;
                            expect( handler3.withArgs( myEvent ).calledOnce ).to.be.true;
                        }
                    );
            });

            it( 'exception during pipeline via Promise.reject()', function() {

                let instance = new Pipeline();

                instance.add( 'start', handler1.yieldsAsync( null, 1 ) );
                instance.add( 'middle', handler2.returns( Promise.reject( new Error( 'bang' ) ) ) );
                instance.add( 'end', handler3 );

                let myEvent = { one: 1 };

                return instance.run( myEvent )
                    .then(
                        function() {

                            throw new Error( 'should not complete the pipeline' );
                        },

                        function( err ) {

                            expect( err.message ).to.equal( 'bang' );

                            expect( handler1.calledOnce ).to.be.true;
                            expect( handler1.withArgs( myEvent ).calledOnce ).to.be.true;

                            expect( handler2.calledOnce ).to.be.true;
                            expect( handler2.withArgs( myEvent ).calledOnce ).to.be.true;

                            expect( handler3.called ).to.be.false;
                        }
                    );
            });

            it( 'exception from handler', function() {

                let instance = new Pipeline();

                instance.add( 'start', handler1.throws( new Error( 'bang' ) ) );
                instance.add( 'middle', handler2 );
                instance.add( 'end', handler3 );

                let myEvent = { one: 1 };

                return instance.run( myEvent )
                    .then(
                        function() {

                            throw new Error( 'should not complete the pipeline' );
                        },

                        function( err ) {

                            expect( err.message ).to.equal( 'bang' );

                            expect( handler1.calledOnce ).to.be.true;
                            expect( handler1.withArgs( myEvent ).calledOnce ).to.be.true;

                            expect( handler2.called ).to.be.false;
                            expect( handler3.called ).to.be.false;
                        }
                    );
            });
        });
    })
});
