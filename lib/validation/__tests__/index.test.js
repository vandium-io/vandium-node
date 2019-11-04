'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const validation = require( '../index' );

describe( 'lib/validation/index', function() {

    describe( '.types', function() {

        it( 'normal operation', function() {

            expect( validation.types ).to.exist;

            // make sure basics are there
            expect( validation.types.string ).to.exist;
            expect( validation.types.object ).to.exist;
            expect( validation.types.number ).to.exist;
            expect( validation.types.date ).to.exist;
            expect( validation.types.boolean ).to.exist;
            expect( validation.types.email ).to.exist;
        });
    });

    describe( '.createSchema', function() {

        it( 'normal operation', function() {

            const types = validation.types;

            let schemaConfig = {

                firstName: 'string:min=1,max=200,required',
                lastName: types.string().min(1).max(200).required()
            };

            let schema = validation.createSchema( schemaConfig );

            expect( schema.firstName ).to.exist;
            expect( schema.firstName.isJoi ).to.be.true;

            expect( schema.lastName ).to.exist;
            expect( schema.lastName.isJoi ).to.be.true;
        });

        it( 'fail: when schema config is invalid', function() {

            let schemaConfig = {

                name: {

                    whatever: true
                }
            };

            expect( validation.createSchema.bind( null, schemaConfig ) ).to.throw( 'invalid schema element at: name' );
        });
    });

    describe( '.validate', function() {

        it( 'normal operation', function() {

            let schemaConfig = {

                firstName: 'string:min=1,max=200,required',
                lastName: validation.types.string().min(1).max(200).required()
            };

            let schema = validation.createSchema( schemaConfig );

            let options = {};

            let values = {

                firstName: '  Jon ',
                lastName: 'Doe'
            };

            let updated = validation.validate( values, schema, options );

            expect( updated ).to.eql( {

                firstName: 'Jon',
                lastName: 'Doe'
            });
        });
    });
});
