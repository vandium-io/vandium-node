'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const validation = require( '../index' );

const uuid = require( 'uuid' );

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
                lastName: validation.types.string().min(1).max(200).required(),
                id: validation.types.uuid(),
            };

            let schema = validation.createSchema( schemaConfig );

            let options = {};

            const id = uuid.v4();

            let values = {

                firstName: '  Jon ',
                lastName: 'Doe',
                id,
            };

            let updated = validation.validate( values, schema, options );

            expect( updated ).to.eql( {

                firstName: 'Jon',
                lastName: 'Doe',
                id,
            });
        });
    });

    describe( '.createArrayBasedSchema', function() {

        it( 'normal operation', function() {

            const schemaConfig = {

                key1: 'string:trim,min=1,max=20,required',
                key2: 'string:trim,min=5,max=20,required',
                ids: validation.types.uuid().label( 'ids' ),
                fred: 'string:required',
            };

            let schema = validation.createArrayBasedSchema( validation.createSchema( schemaConfig ) );

            const id1 = uuid();
            const id2 = uuid();

            let values = {

                key1: [ 'Key1A', ' Key1B', ' Key1C   '],
                key2: [ 'Key2A ' ],
                ids: [  id1, id2 ],
            };

            let updated = validation.validate( values, schema, {} );

            expect( updated ).to.eql( {

                key1: [ 'Key1A', 'Key1B', 'Key1C' ],
                key2: [ 'Key2A' ],
                ids: [  id1, id2 ],
            });
        });
    });
});
