'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const sinon = require( 'sinon' );

const ValidationProvider = require( '../../../../lib/plugins/validation/validation_provider' );

describe( 'lib/plugins/validation/validation_provider', function() {

    describe( 'ValidationProvider', function() {

        let engine;

        let types;

        beforeEach( function() {

            engine = {};
            engine.validate = sinon.stub();

            types = {};
        });

        describe( 'constructor', function() {

            it( 'normal operation', function() {

                let provider = new ValidationProvider( engine, types );

                expect( provider.engine ).to.equal( engine );
                expect( provider.types ).to.equal( types );

                expect( provider.schema ).to.not.exist;
            });
        });

        describe( '.getTypes', function() {

            it( 'normal operation', function() {

                let provider = new ValidationProvider( engine, types );

                expect( provider.getTypes() ).to.equal( types );
            });
        });

        describe( '.validate', function() {

            it( 'no error', function() {

                let provider = new ValidationProvider( engine, types );

                let schema = {};

                let values = { name: 'fred' };

                let options = { doThis: true };

                engine.validate.returns( { value: values } );

                let returnValue = provider.validate( values, schema, options );
                expect( returnValue ).to.equal( values );

                expect( engine.validate.calledOnce ).to.be.true;
                expect( engine.validate.withArgs( values, schema, options ).calledOnce ).to.be.true;
            });

            it( 'error', function() {

                let provider = new ValidationProvider( engine, types );

                let schema = {};

                let values = { name: 'fred' };

                let options = { doThis: true };

                engine.validate.returns( { error: new Error( 'bang' ) } );

                expect( provider.validate.bind( provider, values, schema, options ) ).to.throw( 'bang' );

                expect( engine.validate.calledOnce ).to.be.true;
                expect( engine.validate.withArgs( values, schema, options ).calledOnce ).to.be.true;
            });
        });
    });
});
