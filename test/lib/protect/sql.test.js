'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const MODULE_PATH = 'lib/protect/sql';

const SQLScanner = require( '../../../' + MODULE_PATH );

describe( MODULE_PATH, function() {

    describe( 'SQLScanner', function() {

        describe( 'constructor', function() {

            it( 'normal operation', function() {

                let engine = new SQLScanner();
            });
        });

        describe( '.scan', function() {

            let scanner;

            beforeEach( function() {

                scanner = new SQLScanner().fail();
            });

            it( 'test normal values', function() {

                var event = {

                    string1: "what's up",
                    string2: "double -- dash",
                    string3: "a union between code",
                    string4: "this sentence has union and the word select",
                    number: 1234,
                    object: { number: 123 },
                    bool: true
                };

                scanner.scan( event );
            });

            it( 'regression false positive tests', function() {

                var event = {

                    escapeComment1: "/details?seoName=smith---whatever-main-office"
                };

                scanner.scan( event );
            });

            [
                [ "admin' --", 'ESCAPED_COMMENT' ],
                [ "admin'--", 'ESCAPED_COMMENT' ],
                [ "1' or 1=1;drop table user;", 'ESCAPED_OR' ],
                [ "1' and 1=1;drop table user;", 'ESCAPED_AND' ],
                [ "1=1'; drop table user;--", 'EQUALS_WITH_COMMENT' ],
                [ "1';drop table user;", 'ESCAPED_SEMICOLON' ],
                [ "x' AND 1=(SELECT COUNT(*) FROM tabname); --", 'ESCAPED_AND' ],
                [ "1' union all select name from users where name is not null", 'ESCAPED_UNION' ],
                [ "' union all select name from users where name is not null", 'ESCAPED_UNION' ],

            ].forEach( function( test ) {

                it( 'fail: ' + test[1], function() {

                    var event = {

                        myField: test[0],
                        other: 'my other field'
                    };

                    try {

                        scanner.scan( event );
                    }
                    catch( err ) {

                        expect( err.message ).to.equal( 'myField is invalid' );
                        expect( err.attackType ).to.equal( test[1] );
                    }
                });

                it( 'fail: nested case - ' + test[1], function() {

                    var event = {

                        update: {
                            myField: test[0],
                        },
                        other: 'my other field'
                    };

                    try {

                        scanner.scan( event );
                    }
                    catch( err ) {

                        expect( err.message ).to.equal( 'myField is invalid' );
                        expect( err.attackType ).to.equal( test[1] );
                    }
                });

                it( 'fail: ' + test[1] + ' - report only', function() {

                    scanner.report();

                    var event = {

                        myField: test[0],
                        other: 'my other field'
                    };

                    scanner.scan( event );
                });
            });
        });
    });
});
