'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const sinon = require( 'sinon' );

const MODULE_PATH = 'lib/plugins/validation/validation_provider';

const ValidationProvider = require( '../../../../' + MODULE_PATH );

describe( MODULE_PATH, function() {

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

        describe( '.types', function() {

            it( 'normal operation', function() {

                let provider = new ValidationProvider( engine, types );

                expect( provider.types ).to.equal( types );
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

        describe( '.getInstance', function() {

            it( 'normal operation', function() {

                let provider = ValidationProvider.getInstance();

                expect( provider.constructor.name ).to.equal( 'JoiValidationProvider' );
            });

            it( 'verify cached', function() {

                let provider = ValidationProvider.getInstance();

                expect( provider ).to.exist;
                
                // should be cached
                expect( ValidationProvider.getInstance() ).to.equal( provider );
            });
        });
    });
});
