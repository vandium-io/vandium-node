'use strict';

/*jshint expr: true*/

var expect = require( 'chai' ).expect;

var freshy = require( 'freshy' );

var uuid = require( 'node-uuid' );

const VALIDATION_MODULE_PATH = '../../../../lib/plugins/validation';

describe( 'lib/plugins/validation/index', function() {

    let vandium;

    let validation;

    beforeEach( function() {

        freshy.unload( VALIDATION_MODULE_PATH );
        freshy.unload( '../../../../lib/ignored-properties' );

        validation = require( VALIDATION_MODULE_PATH );

        vandium = {

            types: validation.types()
        };
    });


    describe( '.validate', function() {

        it( 'basic schema', function() {

            var schema = {

                name: vandium.types.string().trim(),
                age: vandium.types.number().required(),
                email: vandium.types.email().required(),
            };

            validation.configure( schema );

            var event = {

                name: '      John Doe  ',
                age: '42',
                email: 'john.doe@vandium.io'
            };

            validation.validate( { event, ignored: [] } );

            expect( event ).to.eql( { name: 'John Doe', age: 42, email: 'john.doe@vandium.io' } );
        });

        it( 'basic schema', function() {

            var schema = {

                name: vandium.types.string().trim(),
                age: vandium.types.number().required(),
                email: vandium.types.email().required(),
            };

            validation.configure( schema );

            var event = {

                name: '      John Doe  ',
                age: '42',
                email: 'john.doe@vandium.io',
                other: 'stuff',
                jwt: 'jwt-goes-here!'
            };

            validation.ignore( 'other' );

            validation.validate( { event, ignored: [ 'jwt' ] } );

            expect( event ).to.eql( { name: 'John Doe', age: 42, email: 'john.doe@vandium.io', other: 'stuff', jwt: 'jwt-goes-here!' } );
        });

        it( 'basic schema (ignored not set in pipelineEvent)', function() {

            var schema = {

                name: vandium.types.string().trim(),
                age: vandium.types.number().required(),
                email: vandium.types.email().required(),
            };

            validation.configure( schema );

            var event = {

                name: '      John Doe  ',
                age: '42',
                email: 'john.doe@vandium.io',
                other: 'stuff'
            };

            validation.ignore( 'other' );

            validation.validate( { event, ignored: null } );

            expect( event ).to.eql( { name: 'John Doe', age: 42, email: 'john.doe@vandium.io', other: 'stuff' } );
        });

        it( 'all types', function() {

            var schema = {

                str: vandium.types.string().required(),

                strWithOpts: vandium.types.string( {} ).required(),

                strWithOptsTrimFalse: vandium.types.string( { trim: false } ).required(),

                strWithOptsTrimTrue: vandium.types.string( { trim: true } ).required(),

                num: vandium.types.number().required(),

                bool: vandium.types.boolean().required(),

                bin: vandium.types.binary().required(),

                date: vandium.types.date().required(),

                email: vandium.types.email().required(),

                uuid: vandium.types.uuid().required(),

                obj: vandium.types.object().required(),

                array: vandium.types.array().required(),

                any: vandium.types.any().required()
            };

            validation.configure( schema );

            var now = Date.now();

            var uuidValue = uuid.v4();

            var event = {

                str: 'my string   ',
                strWithOpts: 'my string with opts  ',
                strWithOptsTrimFalse: 'my string with opts trim=false ',
                strWithOptsTrimTrue: 'my string with opts trim=true    ',
                num: 12345,
                bool: 'true',
                bin: 'aGVsbG8=',
                date: now,
                email: 'test@vandium.io',
                uuid: uuidValue,
                obj: {
                        name: 'my object'
                    },
                array: [ 'one', 2, { name: 'three' } ],
                any: 'anything here'
            };

            validation.validate( { event, ignored: [] } );

            expect( event.str ).to.equal( 'my string' );
            expect( event.strWithOpts ).to.equal( 'my string with opts' );
            expect( event.strWithOptsTrimFalse ).to.equal( 'my string with opts trim=false ' );
            expect( event.strWithOptsTrimTrue ).to.equal( 'my string with opts trim=true' );
            expect( event.num ).to.equal( 12345 );
            expect( event.bool ).to.equal( true );

            expect( event.bin ).to.be.an.instanceof( Buffer );
            expect( event.bin.toString() ).to.equal( 'hello' );

            expect( event.date ).to.be.an.instanceof( Date );
            expect( event.date.getTime() ).to.equal( now );

            expect( event.email ).to.equal( 'test@vandium.io' );

            expect( event.uuid ).to.equal( uuidValue );

            expect( event.obj ).to.eql( { name: 'my object' } );
            expect( event.array ).to.eql( [ 'one', 2, { name: 'three' } ] );
            expect( event.any ).to.equal( 'anything here' );
        });

        it( 'schema should still be in-place', function() {

            var schema = {

                num: vandium.types.number().required(),
            };

            validation.configure( schema );

            validation.configure();

            var event = { num: '1234' };

            validation.validate( { event, ignored: [] } );

            expect( event.num ).to.equal( 1234 );
        });

        it( 'schema can be reset by calling configure again', function() {

            // does nothing
            validation.configure();

            var schema1= {

                name: vandium.types.string().required(),
            };

            validation.configure( schema1 );

            var schema2 = {

                num: vandium.types.number().required(),
            };

            validation.configure( schema2 );

            var event = { num: '1234' };

            validation.validate( { event, ignored: [] } );

            expect( event.num ).to.equal( 1234 );
        });

        it( 'all VANDIUM_* values should be ignored', function() {

            var schema = {

                name: vandium.types.string().required()
            };

            validation.configure( schema );

            var event = {

                name: 'Fred',
                VANDIUM_SPECIAL: 'this is special'
            }

            validation.validate( { event, ignored: [] } );

            expect( event.name ).to.equal( 'Fred' );
            expect( event.VANDIUM_SPECIAL ).to.equal( 'this is special' );
        });

        it( 'with ignored values', function() {

            var schema = {

                name: vandium.types.string().required()
            };

            validation.configure( schema );

            validation.ignore( 'special1', [ 'special2', 'special3' ] );

            var event = {

                name: 'Fred',
                special1: 1,
                special2: 2,
                special3: 3
            }

            validation.validate( { event, ignored: [] } );

            expect( event.name ).to.equal( 'Fred' );
            expect( event.special1 ).to.equal( 1 );
            expect( event.special2 ).to.equal( 2 );
            expect( event.special3 ).to.equal( 3 );
        });

        it( 'fail when extra values are present in the event', function() {

            var schema = {

                name: vandium.types.string().trim(),
                age: vandium.types.number().required(),
                email: vandium.types.email().required(),
            };

            validation.configure( schema );

            var event = {

                name: 'John Doe',
                age: '42',
                email: 'john.doe@vandium.io',
                other: 'other data that will cause an exception'
            };

            let pipelineEvent = { event, ignored: [] };

            expect( validation.validate.bind( validation, pipelineEvent ) ).to.throw( '"other" is not allowed' );
        });
    });

    describe( '.validator', function() {

        it( 'normal operation', function() {

            expect( validation.validator ).to.exist;
        });
    });
});
