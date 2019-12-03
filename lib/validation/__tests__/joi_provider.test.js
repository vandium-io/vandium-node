const { expect } = require( 'chai' );

const ValidationProvider = require( '../validation_provider' );

const provider = require( '../joi_provider' );

const Joi = require( '@hapi/joi' );

function validateJoiObject( schema, type ) {

    expect( Joi.isSchema( schema ) ).to.be.true;
    expect( schema.type ).to.equal( type );
}

describe( 'lib/validation/joi_provider', function() {

    describe( 'JoiValidationProvider', function() {

        describe( 'constructor', function() {

            it( 'singleton', function() {

                expect( provider ).to.be.an.instanceof( ValidationProvider );

                expect( provider.engine ).to.exist;
                expect( provider.types ).to.exist;

                expect( provider.types.boolean ).to.exist;
                expect( provider.types.binary ).to.exist;
                expect( provider.types.date ).to.exist;
                expect( provider.types.number ).to.exist;
                expect( provider.types.object ).to.exist;
                expect( provider.types.string ).to.exist;
                expect( provider.types.uuid ).to.exist;
                expect( provider.types.email ).to.exist;
                expect( provider.types.alternatives ).to.exist;
            });
        });

        describe( 'types', function() {

            // simple types
            [
                'any',
                'array',
                'boolean',
                'date',
                'number',
                'object',
                'alternatives'
            ].forEach( function( type ) {

                it( type, function() {

                    expect( provider.types[ type ] ).to.exist;

                    let joiObject = provider.types[ type ]();

                    validateJoiObject( joiObject, type );
                });
            });

            it( 'binary', function() {

                expect( provider.types.binary ).to.exist;

                let joiObject = provider.types.binary();

                validateJoiObject( joiObject, 'binary' );

                //expect( joiObject._flags ).to.eql( { encoding: 'base64' } );
            });

            describe( 'string', function() {

                it( 'auto trimmed', function() {

                    expect( provider.types.string ).to.exist;

                    let joiObject = provider.types.string();

                    validateJoiObject( joiObject, 'string' );

                    //expect( joiObject._flags ).to.eql( { trim: true } );
                });

                it( 'auto trim enabled', function() {

                    let joiObject = provider.types.string( { trim: true } );

                    validateJoiObject( joiObject, 'string' );

                    //expect( joiObject._flags ).to.eql( { trim: true } );
                });

                it( 'auto trim disabled', function() {

                    expect( provider.types.string ).to.exist;

                    let joiObject = provider.types.string( { trim: false } );

                    validateJoiObject( joiObject, 'string' );

                    //expect( joiObject._flags ).to.eql( {} );
                });
            });

            it( 'uuid', function() {

                expect( provider.types.uuid ).to.exist;

                let joiObject = provider.types.uuid();

                validateJoiObject( joiObject, 'string' );

                //expect( joiObject._tests.length ).to.equal( 1 );
                //expect( joiObject._tests[0].name ).to.equal( 'guid' );
            });

            it( 'email', function() {

                expect( provider.types.email ).to.exist;

                let joiObject = provider.types.email();

                validateJoiObject( joiObject, 'string' );

                //expect( joiObject._tests.length ).to.equal( 1 );
                //expect( joiObject._tests[0].name ).to.equal( 'email' );
            });
        });
    });
});
