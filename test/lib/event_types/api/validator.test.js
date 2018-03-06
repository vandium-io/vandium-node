'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const MODULE_PATH = 'lib/event_types/api/validator';

const vandium = require( '../../../../' );

const Validator = require( '../../../../' + MODULE_PATH );

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

                expect( instance.validators.length ).to.equal( 3 );
                expect( instance.validators[0].key ).to.equal( 'headers' );
                expect( instance.validators[1].key ).to.equal( 'queryStringParameters' );
                expect( instance.validators[2].key ).to.equal( 'body' );
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

                expect( instance.validators.length ).to.equal( 3 );
                expect( instance.validators[0].key ).to.equal( 'headers' );
                expect( instance.validators[1].key ).to.equal( 'queryStringParameters' );
                expect( instance.validators[2].key ).to.equal( 'body' );
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
                        last: 'smith'
                    },

                    body: {

                        age: '6'
                    }
                };

                instance.validate( event );

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

                expect( instance.validate.bind( instance, event ) ).to.throw( /"name" is required/ );
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

                instance.validate.bind( instance, event )

                //expect( instance.validate.bind( instance, event ) ).to.throw( '"name" is required' );
            });
        });
    });
});
