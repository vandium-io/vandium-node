const { expect } = require( 'chai' );

const MODULE_PATH = 'lib/event_types/api/validator';

const vandium = require( '../../../../' );

const Validator = require( '../validator' );

describe( MODULE_PATH, function() {

    describe( 'Validator', function() {

        describe( 'constructor', function() {

            it( 'headers, queryStringParameters and body', function() {

                let schemas = {

                    headers: {

                        name: vandium.types.string()
                    },

                    queryStringParameters: {

                        expand: vandium.types.boolean()
                    },

                    body: {

                        age: vandium.types.number()
                    },

                    somethingElese: {

                        whatever: true
                    }
                };

                let instance = new Validator( schemas );

                expect( instance.validators.length ).to.equal( 5 );
                expect( instance.validators[0].key ).to.equal( 'headers' );
                expect( instance.validators[1].key ).to.equal( 'queryStringParameters' );
                expect( instance.validators[2].key ).to.equal( 'body' );
                expect( instance.validators[3].key ).to.equal( 'multiValueHeaders' );
                expect( instance.validators[4].key ).to.equal( 'multiValueQueryStringParameters' );
            });

            it( 'headers, query and body', function() {

                let schemas = {

                    headers: {

                        name: vandium.types.string()
                    },

                    query: {

                        expand: vandium.types.boolean()
                    },

                    body: {

                        age: vandium.types.number()
                    },

                    somethingElese: {

                        whatever: true
                    }
                };

                let instance = new Validator( schemas );

                expect( instance.validators.length ).to.equal( 5 );
                expect( instance.validators[0].key ).to.equal( 'headers' );
                expect( instance.validators[1].key ).to.equal( 'queryStringParameters' );
                expect( instance.validators[2].key ).to.equal( 'body' );
                expect( instance.validators[3].key ).to.equal( 'multiValueHeaders' );
                expect( instance.validators[4].key ).to.equal( 'multiValueQueryStringParameters' );
            });

            it( 'headers, query and body [no match]', function() {

                let schemas = {

                    headers: {

                        name: vandium.types.string()
                    },

                    query: {

                        expand: vandium.types.boolean()
                    },

                    body: {

                        age: vandium.types.number(),

                        __allowUnknown: true,
                    },

                    somethingElese: {

                        whatever: true
                    },

                    __allowUnknown: false,
                };

                let instance = new Validator( schemas );

                expect( instance.validators.length ).to.equal( 5 );
                expect( instance.validators[0].key ).to.equal( 'headers' );
                expect( instance.validators[0].options ).to.eql( { allowUnknown: false } );
                expect( instance.validators[1].key ).to.equal( 'queryStringParameters' );
                expect( instance.validators[1].options ).to.eql( { allowUnknown: false } );
                expect( instance.validators[2].key ).to.equal( 'body' );
                expect( instance.validators[2].options ).to.eql( { allowUnknown: true } );
                expect( instance.validators[3].key ).to.equal( 'multiValueHeaders' );
                expect( instance.validators[3].options ).to.eql( { allowUnknown: false } );
                expect( instance.validators[4].key ).to.equal( 'multiValueQueryStringParameters' );
                expect( instance.validators[4].options ).to.eql( { allowUnknown: false } );
            });
        });

        describe( '.validate', function() {

            it( 'normal operation', function() {

                let schemas = {

                    headers: {

                        name: vandium.types.string()
                    },

                    query: {

                        number: vandium.types.number()
                    },

                    body: {

                        age: vandium.types.number()
                    }
                };

                let instance = new Validator( schemas );

                let event = {

                    headers: {

                        name: '  fred  ',
                        last: 'smith',
                    },

                    multiValueHeaders: {

                        name: ['  fred  '],
                        last: ['smith'],
                    },

                    body: {

                        age: '6',
                    }
                };

                instance.validate( event );

                expect( event.multiValueHeaders.name ).to.eql( [ 'fred' ] );    // trimmed
                expect( event.headers.name ).to.equal( 'fred' );     // trimmed
                expect( event.body.age ).to.equal( 6 );     // converted
            });

            it( 'missing required values', function() {

                let schemas = {

                    headers: {

                        name: vandium.types.string().required()
                    }
                };

                let instance = new Validator( schemas );

                let event = {

                    headers: {

                        last: 'smith'
                    }
                };

                try {

                    instance.validate( event );
                    throw new Error( 'Validation expected to fail' );
                }
                catch( err ) {

                    expect( err.name ).to.equal( 'ValidationError' );
                    expect( err ).to.nested.contain(  /"name" is required/ );
                    expect( err.statusCode ).to.equal( 400 );
                }
            });

            it( 'undefined value objects', function() {

                let schemas = {

                    queryStringParameters: {

                        name: vandium.types.string()
                    }
                };

                let instance = new Validator( schemas );

                let event = {

                };

                instance.validate( event);

                expect( event ).to.eql( {} );
            });

            it( 'extra properties, __allowUnknown = false [global]', function() {

                let schemas = {

                    queryStringParameters: {

                        name: vandium.types.string()
                    },

                    __allowUnknown: false
                };

                let instance = new Validator( schemas );

                let event = {

                    queryStringParameters: {

                        name: 'fred',
                        age: 42
                    },
                };

                expect( instance.validate.bind( instance, event ) ).to.throw(  '"age" is not allowed' );
            });

            it( 'extra properties, __allowUnknown = false [local]', function() {

                let schemas = {

                    queryStringParameters: {

                        name: vandium.types.string(),
                        __allowUnknown: false
                    },
                };

                let instance = new Validator( schemas );

                let event = {

                    queryStringParameters: {

                        name: 'fred',
                        age: 42
                    },
                };

                expect( instance.validate.bind( instance, event ) ).to.throw(  '"age" is not allowed' );
            });
        });
    });
});
