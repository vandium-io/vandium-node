const { expect } = require( 'chai' );

const sinon = require( 'sinon' );

const MODULE_PATH = 'lib/validation/validation_provider';

const ValidationProvider = require( '../validation_provider' );

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

            it( 'normal operation', function() {

                let provider = new ValidationProvider( engine, types );

                expect( provider.validate.bind( provider ) ).to.throw( 'not implemented' );
            });
        });

        describe( '.isSchema', function() {

            it( 'normal operation', function() {

                let provider = new ValidationProvider( engine, types );

                expect( provider.isSchema.bind( provider ) ).to.throw( 'not implemented' );
            });
        });

        describe( '.createArrayBasedSchema', function() {

            it( 'normal operation', function() {

                let provider = new ValidationProvider( engine, types );

                expect( provider.createArrayBasedSchema.bind( provider, {} ) ).to.throw( 'not implemented' );
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
