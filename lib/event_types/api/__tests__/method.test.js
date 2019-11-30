/*jshint expr: true*/

const { expect } = require( 'chai' );

const sinon = require( 'sinon' );

const MethodHandler = require( '../method' );

describe( 'lib/event_types/api/cookies', function() {

    describe( 'MethodHandler', function() {

        describe( 'constructor', function() {

            it( 'normal operation', function() {

                const instance = new MethodHandler();

                expect( instance._executor ).to.exist;
                expect( instance._validator ).to.exist;
                expect( instance._onResponse ).to.exist;
            });
        });

        describe( '.setHandler', function() {

            it( 'normal operation', function() {

                const instance = new MethodHandler();

                const existingExecutor = instance.executor;

                instance.setHandler( () => {} );

                expect( instance.executor ).to.not.equal( existingExecutor );
            });
        });

        describe( '.setValidation', function() {

            it( 'normal operation', function() {

                const instance = new MethodHandler();

                const existingValidator = instance.validator;

                instance.setValidation( { body: { name: 'string' } } );

                expect( instance.validator ).to.not.equal( existingValidator );
            });
        });

        describe( '.setOnResponse', function() {

            it( 'normal operation', function() {

                const instance = new MethodHandler();

                const newOnResponse = () => {};
                instance.setOnResponse( newOnResponse );

                expect( instance.onResponse ).to.equal( newOnResponse );
            });
        });
    });
});
