'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const sinon = require( 'sinon' );

const Handler = require( '../../../lib/event_types/handler' );

describe( 'lib/event_types/handler', function() {

    describe( 'constructor', function() {

        it( 'normal operation', function() {

            let instance = new Handler();

            expect( instance.afterFunc ).to.exist;
            expect( instance.eventProc ).to.exist;
        });
    });

    describe( '.addMethodsToHandler', function() {

        it( 'normal operation', function() {

            let lambda = function() {};
            expect( lambda.finally ).to.not.exist;

            let instance = new Handler();

            instance.addMethodsToHandler( lambda );
            expect( lambda.finally ).to.exist;
            expect( lambda.finally ).to.be.a( 'function' );

            let finallyFunc = function() {};

            let returnValue = lambda.finally( finallyFunc );
            expect( returnValue ).to.equal( lambda );

            expect( instance.afterFunc ).to.equal( finallyFunc );
        });
    });

    describe( '.handler', function() {

        it( 'normal operation', function() {

            let instance = new Handler();

            expect( instance.executor ).to.not.exist;

            let handler = sinon.stub().returns( 42 );

            let returnValue = instance.handler( handler );
            expect( returnValue ).to.equal( instance );

            expect( handler.called ).to.be.false;

            expect( instance.executor ).to.exist;
            expect( instance.executor ).to.not.equal( handler );

            let executorReturnValue = instance.executor( {}, {} );
            expect( executorReturnValue ).to.be.instanceof( Promise );

            return executorReturnValue
                .then( (value) => {

                    expect( value ).to.equal( 42 );
                    expect( handler.calledOnce ).to.be.true;
                });
        });
    });

    describe( '.processResult', function() {

        it( 'normal operation', function() {

            let instance = new Handler();

            let processed = instance.processResult( { value: 42 }, {} );

            expect( processed ).to.eql( { result: { value: 42 } } );
        });
    });

    describe( '.processError', function() {

        it( 'normal operation', function() {

            let instance = new Handler();

            let error = new Error( 'bang' );

            let processed = instance.processError( error, {} );

            expect( processed ).to.eql( { error } );
        });
    });

    describe( '.handleCallback', function() {

        it( 'result object contains a result', function() {

            let resultObject = { result: 42 };

            let instance = new Handler();

            let callback = sinon.stub();

            instance.handleCallback( resultObject, callback );

            expect( callback.calledOnce ).to.be.true;
            expect( callback.firstCall.args ).to.eql( [ undefined, resultObject.result ] );
        });

        it( 'result object contains an error', function() {

            let resultObject = { error: new Error( 'bang' ) };

            let instance = new Handler();

            let callback = sinon.stub();

            instance.handleCallback( resultObject, callback );

            expect( callback.calledOnce ).to.be.true;
            expect( callback.firstCall.args ).to.eql( [ resultObject.error, undefined ] );
        });
    });

    describe( '.finally', function() {

        it( 'normal operation', function() {

            let finallyFunc = function() {};

            let instance = new Handler();
            expect( instance.afterFunc ).to.exist;
            expect( instance.afterFunc ).to.not.equal( finallyFunc );

            let returnValue = instance.finally( finallyFunc );
            expect( returnValue ).to.equal( instance );
            expect( instance.afterFunc ).to.equal( finallyFunc );
        });
    });

    describe( '.eventProcessor', function() {

        it( 'normal operation', function() {

            let eventProc = function() {};

            let instance = new Handler();
            expect( instance.eventProc ).to.exist;
            expect( instance.eventProc ).to.not.equal( eventProc );

            let returnValue = instance.eventProcessor( eventProc );
            expect( returnValue ).to.equal( instance );
            expect( instance.eventProc ).to.equal( eventProc );
        });
    });
});
