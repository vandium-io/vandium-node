'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const sinon = require( 'sinon' );

const executors = require( '../../../lib/event_types/executors' );

describe( 'lib/event_types/executors', function() {

    describe( '.create', function() {

        it( 'sync handler with event and context', function() {

            let handler = (event, context) => { return 42; };

            let executor = executors.create( handler );

            return executor( {/*event*/}, { /*context*/} )
                .then( (result) => {

                    expect( result ).to.equal( 42 );
                });
        });

        it( 'sync handler with event and context, throws exception', function() {

            let handler = (event, context) => { throw new Error( 'bang' ) };

            let executor = executors.create( handler );

            return executor( {/*event*/}, { /*context*/} )
                .then(
                    (result) => {

                        throw new Error( 'should not resolve' );
                    },
                    (err) => {

                        expect( err.message ).to.equal( 'bang' );
                    }
                );
        });

        it( 'handler returns Promise.resolve(), event and context', function() {

            let handler = (event, context) => { return Promise.resolve( 42 ); };

            let executor = executors.create( handler );

            return executor( {/*event*/}, { /*context*/} )
                .then( (result) => {

                    expect( result ).to.equal( 42 );
                });
        });

        it( 'handler returns Promise.reject(), event and context', function() {

            let handler = (event, context) => { return Promise.reject( new Error( 'bang' ) ); };

            let executor = executors.create( handler );

            return executor( {/*event*/}, { /*context*/} )
                .then(
                    (result) => {

                        throw new Error( 'should not resolve' );
                    },
                    (err) => {

                        expect( err.message ).to.equal( 'bang' );
                    }
                )
        });

        it( 'async handler, callback( null, result )', function() {

            let handler = (event, context, callback) => { callback( null,  42 ); };

            let executor = executors.create( handler );

            return executor( {/*event*/}, { /*context*/} )
                .then( (result) => {

                    expect( result ).to.equal( 42 );
                });
        });

        it( 'async handler, callback( err )', function() {

            let handler = (event, context, callback) => { callback( new Error( 'bang' ) ); };

            let executor = executors.create( handler );

            return executor( {/*event*/}, { /*context*/} )
                .then(
                    (result) => {

                        throw new Error( 'should not resolve' );
                    },
                    (err) => {

                        expect( err.message ).to.equal( 'bang' );
                    }
                )
        });

        it( 'async handler, uncaught error', function() {

            let handler = (event, context, callback) => { throw new Error( 'bang' ); };

            let executor = executors.create( handler );

            return executor( {/*event*/}, { /*context*/} )
                .then(
                    (result) => {

                        throw new Error( 'should not resolve' );
                    },
                    (err) => {

                        expect( err.message ).to.equal( 'bang' );
                    }
                )
        });
    });
});
