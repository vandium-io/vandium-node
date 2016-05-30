'use strict';

/*jshint expr: true*/

var expect = require( 'chai' ).expect;

var utils = require( '../../lib/utils' );

describe( 'lib/utils', function() {

    describe( '.parseJSON', function() {

        var json = {

            one: 1,
            two: 'two',
            three: 'iii'
        };

        it( 'with callback', function() {

            utils.parseJSON( JSON.stringify( json ), function( err, obj ) {

                expect( err ).to.not.exist;
                expect( obj ).to.eql( json );
            });
        });

        it( 'with callback and error condition', function() {

            utils.parseJSON( '==' + JSON.stringify( json ), function( err, obj ) {

                expect( err ).to.exist;
                expect( obj ).to.not.exist;
            });
        });

        it( 'without callback', function() {

            expect( utils.parseJSON( JSON.stringify( json ) ) ).to.eql( json );
        });

        it( 'without callback with exception', function() {

            expect( utils.parseJSON.bind( null, '===' + JSON.stringify( json ) ) ).to.throw();
        });
    });

    describe( '.isFunction', function() {

        it( 'function', function() {

            expect( utils.isFunction( describe ) ).to.be.true;
        });

        it( 'other', function() {

            expect( utils.isFunction( "hello" ) ).to.be.false;
            expect( utils.isFunction( 42 ) ).to.be.false;
            expect( utils.isFunction() ).to.be.false;
        })
    });

    describe( '.isArray', function() {

        it( 'stubbed implementation', function() {

            expect( utils.isArray ).to.equal( Array.isArray );
        });
    });

    describe( '.isPromise', function() {

        it( 'promise', function() {

            expect( utils.isPromise( Promise.resolve() ) ).to.be.true;
            expect( utils.isPromise( Promise.reject() ) ).to.be.true;
            expect( utils.isPromise( new Promise( function() {}) ) ).to.be.true;
        });

        it( 'other', function() {

            expect( utils.isPromise( { then: function() {} } ) ).to.be.false;
            expect( utils.isPromise( { catch: function() {} } ) ).to.be.false;
            expect( utils.isPromise() ).to.be.false;
        });
    });

    describe( '.isObject', function() {

        it( 'object', function() {

            expect( utils.isObject( {} ) ).to.be.true;
            expect( utils.isObject( describe ) ).to.be.true;
        });

        it( 'other', function() {

            expect( utils.isObject( 1234 ) ).to.be.false;
            expect( utils.isObject( "fred" ) ).to.be.false;
            expect( utils.isObject() ).to.be.false;
        });
    });

    describe( '.isString', function() {

        it( 'string', function() {

            expect( utils.isString( "test" ) ).to.be.true;
            expect( utils.isString( new Buffer( "string" ).toString() ) ).to.be.true;
        });

        it( 'other', function() {

            expect( utils.isString( 1234 ) ).to.be.false;
            expect( utils.isString( {} ) ).to.be.false;
            expect( utils.isString( describe ) ).to.be.false;
        });
    });

    describe( '.clone', function() {

        it( 'normal operation', function() {

            let v1 = { name: 'fred', age: 42 };

            let v2 = utils.clone( v1 );

            expect( v1 ).to.not.equal( v2 );
            expect( v1 ).to.eql( v2 );
        });
    });

    describe( '.parseBoolean', function() {

        [ true, 'yes', 'On', 'True', 'Yes', 'true' ].forEach( function( value ) {

            it( 'value: ' + value, function() {

                expect( utils.parseBoolean( value ) ).to.be.true;
            })
        });

        [ false, 'no', 'off', 'False', 'No', 'false' ].forEach( function( value ) {

            it( 'value: ' + value, function() {

                expect( utils.parseBoolean( value ) ).to.be.false;
            })
        });

        it( 'unknown value', function() {

            expect( utils.parseBoolean( 'whatever' ) ).to.be.false;
        });

        it( 'null value', function() {

            expect( utils.parseBoolean( null ) ).to.be.false;
        });

        it( 'undefined value', function() {

            expect( utils.parseBoolean() ).to.be.false;
        });
    });
});
