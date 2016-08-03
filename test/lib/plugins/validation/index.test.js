'use strict';

/*jshint expr: true*/

var expect = require( 'chai' ).expect;

var uuid = require( 'node-uuid' );

const MODULE_PATH = 'lib/plugins/validation';

const ValidationPlugin = require( '../../../../' + MODULE_PATH );

describe( MODULE_PATH, function() {

    describe( 'ValidationPlugin', function() {

        describe( 'constructor', function() {

            it( 'normal operation', function() {

                let plugin = new ValidationPlugin();

                expect( plugin.name ).to.equal( 'validation' );

                expect( plugin.ignoredProperties ).to.eql( [] );
                expect( plugin.configuredSchema ).to.not.exist;
            });
        });

        describe( '.validator', function() {

            it( 'normal operation', function() {

                let plugin = new ValidationPlugin();

                expect( plugin.validator ).to.exist;

                expect( plugin.validator.string ).to.exist;
                expect( plugin.validator.number ).to.exist;
                expect( plugin.validator.boolean ).to.exist;
                expect( plugin.validator.object ).to.exist;
            });
        });

        describe( '.types', function() {

            it( 'normal operation', function() {

                let plugin = new ValidationPlugin();

                expect( plugin.types ).to.exist;

                expect( plugin.types.string ).to.exist;
                expect( plugin.types.number ).to.exist;
                expect( plugin.types.boolean ).to.exist;
                expect( plugin.types.boolean ).to.exist;
            });
        });


        describe( '.configure', function() {

            it( 'with object schema', function() {

                let plugin = new ValidationPlugin();

                expect( plugin.configuredSchema ).to.not.exist;

                const types = plugin.types;

                let schema = {

                    name: types.string().min(1).max( 60 ).required(),
                    age: types.number().min(0).max( 120 )
                };

                plugin.configure( { schema } );

                expect( plugin.configuredSchema ).to.exist;
                expect( plugin.configuredSchema.name ).to.exist;
                expect( plugin.configuredSchema.age ).to.exist;

                expect( plugin.state ).to.eql( { enabled: true, keys: [ 'name', 'age' ], ignored: [] } );
            });

            it( 'with string schema', function() {

                let plugin = new ValidationPlugin();

                expect( plugin.configuredSchema ).to.not.exist;

                let schema = {

                    name: 'string:min=1,max=60,required',
                    age: 'number:min=0,max=120'
                };

                plugin.configure( { schema } );

                expect( plugin.configuredSchema ).to.exist;
                expect( plugin.configuredSchema.name ).to.exist;
                expect( plugin.configuredSchema.age ).to.exist;

                expect( plugin.state ).to.eql( { enabled: true, keys: [ 'name', 'age' ], ignored: [] } );
            });

            it( 'with string object notation', function() {

                let plugin = new ValidationPlugin();

                expect( plugin.configuredSchema ).to.not.exist;

                let schema = {

                    name: {

                        '@type': 'string',
                        min: 1,
                        max: 60,
                        required: true
                    },

                    age: {

                        '@type': 'number',
                        min: 0,
                        max: 120
                    }
                };

                plugin.configure( { schema } );

                expect( plugin.configuredSchema ).to.exist;
                expect( plugin.configuredSchema.name ).to.exist;
                expect( plugin.configuredSchema.age ).to.exist;

                expect( plugin.state ).to.eql( { enabled: true, keys: [ 'name', 'age' ], ignored: [] } );
            });

            it( 'with object and string schema', function() {

                let plugin = new ValidationPlugin();

                expect( plugin.configuredSchema ).to.not.exist;

                const types = plugin.types;

                let schema = {

                    name: types.string().min(1).max( 60 ).required(),
                    age: 'number:min=0,max=120'
                }

                plugin.configure( { schema } );

                expect( plugin.configuredSchema ).to.exist;
                expect( plugin.configuredSchema.name ).to.exist;
                expect( plugin.configuredSchema.age ).to.exist;

                expect( plugin.state ).to.eql( { enabled: true, keys: [ 'name', 'age' ], ignored: [] } );
            });

            it( 'with schema and other properties', function() {

                let plugin = new ValidationPlugin();

                expect( plugin.configuredSchema ).to.not.exist;

                const types = plugin.types;

                let schema = {

                    name: types.string().min(1).max( 60 ).required(),
                    age: 'number:min=0,max=120'
                };

                let ignore = [ 'jwt' ];

                plugin.configure( { schema, ignore } );

                expect( plugin.configuredSchema ).to.exist;
                expect( plugin.configuredSchema.name ).to.exist;
                expect( plugin.configuredSchema.age ).to.exist;

                expect( plugin.state ).to.eql( { enabled: true, keys: [ 'name', 'age' ], ignored: [ 'jwt' ] } );
            });

            it( 'with schema only flag set', function() {

                let plugin = new ValidationPlugin();

                plugin.ignore( 'jwt' );

                expect( plugin.configuredSchema ).to.not.exist;

                const types = plugin.types;

                let schema = {

                    name: types.string().min(1).max( 60 ).required(),
                    age: 'number:min=0,max=120'
                };

                plugin.configure( { schema }, true );

                expect( plugin.configuredSchema ).to.exist;
                expect( plugin.configuredSchema.name ).to.exist;
                expect( plugin.configuredSchema.age ).to.exist;

                expect( plugin.state ).to.eql( { enabled: true, keys: [ 'name', 'age' ], ignored: [ 'jwt' ] } );
            });

            it( 'no schema with schema only flag set', function() {

                let plugin = new ValidationPlugin();

                plugin.ignore( 'jwt' );

                expect( plugin.configuredSchema ).to.not.exist;

                plugin.configure( { }, true );

                expect( plugin.state ).to.eql( { enabled: false } );
            });

            it( 'with empty config', function() {

                let plugin = new ValidationPlugin();

                expect( plugin.state ).to.eql( { enabled: false } );

                plugin.configure( {} );

                expect( plugin.state ).to.eql( { enabled: false } );

                plugin.configure();

                expect( plugin.state ).to.eql( { enabled: false } );
            });

            it( 'fail: with invalid schema', function() {

                let plugin = new ValidationPlugin();

                expect( plugin.configuredSchema ).to.not.exist;

                let schema = {

                    name: true,
                    age: 42
                };

                expect( plugin.configure.bind( plugin, { schema } ) ).to.throw( 'invalid schema element at: name' );
            });
        });

        describe( '.state', function() {

            it( 'normal operation', function() {

                let plugin = new ValidationPlugin();

                expect( plugin.state ).to.eql( { enabled: false } );

                plugin.configure( {

                    schema: {

                        name: 'string:min=1,max=60,required',
                        age: 'number:min=0,max=120'
                    }
                });

                expect( plugin.state ).to.eql( { enabled: true, keys: [ 'name', 'age' ], ignored: [] } );

                plugin.configure();

                expect( plugin.state ).to.eql( { enabled: false } );
            });
        });

        describe( '.execute', function() {

            it( 'basic schema, using object based schema', function( done ) {

                let plugin = new ValidationPlugin();

                const types = plugin.types;

                var schema = {

                    name: types.string().trim(),
                    age: types.number().required(),
                    email: types.email().required(),
                };

                plugin.configure( { schema } );

                var event = {

                    name: '      John Doe  ',
                    age: '42',
                    email: 'john.doe@io'
                };

                plugin.execute( { event, ignored: [] }, function( err, result ) {

                    if( err ) {

                        return done( err );
                    }

                    expect( result ).to.not.exist;

                    expect( event ).to.eql( { name: 'John Doe', age: 42, email: 'john.doe@io' } );

                    done();
                });
            });

            it( 'basic schema, using string based schema, ignored not set in event', function( done ) {

                let plugin = new ValidationPlugin();

                var schema = {

                    name: 'string:trim,required',
                    age: 'number:required',
                    email: 'string:email,required'
                };

                plugin.configure( { schema } );

                var event = {

                    name: '      John Doe  ',
                    age: '42',
                    email: 'john.doe@io'
                };

                plugin.execute( { event }, function( err, result ) {

                    if( err ) {

                        return done( err );
                    }

                    expect( result ).to.not.exist;

                    expect( event ).to.eql( { name: 'John Doe', age: 42, email: 'john.doe@io' } );

                    done();
                });
            });

            it( 'all types', function( done ) {

                let plugin = new ValidationPlugin();

                const types = plugin.types;

                var schema = {

                    str: types.string().required(),

                    strWithOpts: types.string( {} ).required(),

                    strWithOptsTrimFalse: types.string( { trim: false } ).required(),

                    strWithOptsTrimTrue: types.string( { trim: true } ).required(),

                    num: types.number().required(),

                    bool: types.boolean().required(),

                    bin: types.binary().required(),

                    date: types.date().required(),

                    email: types.email().required(),

                    uuid: types.uuid().required(),

                    obj: types.object().required(),

                    array: types.array().required(),

                    any: types.any().required()
                };

                plugin.configure( { schema } );

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
                    email: 'test@io',
                    uuid: uuidValue,
                    obj: {
                            name: 'my object'
                        },
                    array: [ 'one', 2, { name: 'three' } ],
                    any: 'anything here'
                };

                plugin.execute( { event, ignored: [] }, function( err, result ) {

                    if( err ) {

                        return done( err );
                    }

                    expect( result ).to.not.exist;

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

                    expect( event.email ).to.equal( 'test@io' );

                    expect( event.uuid ).to.equal( uuidValue );

                    expect( event.obj ).to.eql( { name: 'my object' } );
                    expect( event.array ).to.eql( [ 'one', 2, { name: 'three' } ] );
                    expect( event.any ).to.equal( 'anything here' );

                    done();
                });
            });

            it( 'all VANDIUM_***** values should be ignored', function( done ) {

                let plugin = new ValidationPlugin();

                const types = plugin.types;

                var schema = {

                    name: types.string().required()
                };

                plugin.configure( { schema } );

                var event = {

                    name: 'Fred',
                    VANDIUM_SPECIAL: 'this is special'
                }

                plugin.execute( { event, ignored: [] }, function( err, result ) {

                    if( err ) {

                        return done( err );
                    }

                    expect( result ).to.not.exist;

                    expect( event.name ).to.equal( 'Fred' );
                    expect( event.VANDIUM_SPECIAL ).to.equal( 'this is special' );

                    done();
                });
            });

            it( 'with ignored values', function( done ) {

                let plugin = new ValidationPlugin();

                const types = plugin.types;

                var schema = {

                    name: types.string().required()
                };

                plugin.configure( { schema } );

                plugin.ignore( 'special1', [ 'special2', 'special3' ] );

                var event = {

                    name: 'Fred',
                    special1: 1,
                    special2: 2,
                    special3: 3
                }

                plugin.execute( { event, ignored: [] }, function( err, result ) {

                    if( err ) {

                        return done( err );
                    }

                    expect( result ).to.not.exist;

                    expect( event.name ).to.equal( 'Fred' );
                    expect( event.special1 ).to.equal( 1 );
                    expect( event.special2 ).to.equal( 2 );
                    expect( event.special3 ).to.equal( 3 );

                    done();
                });
            });

            it( 'fail when extra values are present in the event', function( done ) {

                let plugin = new ValidationPlugin();

                const types = plugin.types;

                var schema = {

                    name: types.string().trim(),
                    age: types.number().required(),
                    email: types.email().required(),
                };

                plugin.configure( { schema } );

                var event = {

                    name: 'John Doe',
                    age: '42',
                    email: 'john.doe@io',
                    other: 'other data that will cause an exception'
                };

                plugin.execute( { event, ignored: [] }, function( err, result ) {

                    expect( err ).to.exist;
                    expect( err.message ).to.equal( 'validation error: "other" is not allowed' );

                    expect( result ).to.not.exist;

                    done();
                });
            });
        });
    });
});
