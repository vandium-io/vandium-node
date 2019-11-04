'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const MODULE_PATH = 'lib/protect/sql';

const SQLScanner = require( '../sql' );

describe( MODULE_PATH, function() {

    describe( 'SQLScanner', function() {

        describe( 'constructor', function() {

            it( 'no options', function() {

                let scanner = new SQLScanner();

                expect( scanner.enabled ).to.be.true;
                expect( scanner.mode ).to.equal( 'report' );
            });

            it( 'mode = disabled', function() {

                let scanner = new SQLScanner( { mode: 'disabled' } );

                expect( scanner.enabled ).to.be.false;
                expect( scanner.mode ).to.not.exist;
            });

            [
                [ 'report', 'report' ],
                [ 'fail', 'fail' ],
                [ 'whatever', 'report' ]

            ].forEach( (test) => {

                it( `mode = ${test[0]}`, function() {

                    let scanner = new SQLScanner( { mode: test[0] } );

                    expect( scanner.enabled ).to.be.true;
                    expect( scanner.mode ).to.equal( test[1] );
                });
            })
        });

        describe( '.scan', function() {

            it( 'test normal values', function() {

                let scanner = new SQLScanner( { mode: 'fail' } );

                let event = {

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

                let scanner = new SQLScanner( { mode: 'fail' } );

                let event = {

                    escapeComment1: "/details?seoName=smith---whatever-main-office"
                };

                scanner.scan( event );
            });

            it( 'html code', function() {

                let scanner = new SQLScanner( { mode: 'fail' } );

                let event = {

                    escapeComment1: '&lt;p&gt;--&lt;/p&gt;'
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

                    let event = {

                        myField: test[0],
                        other: 'my other field'
                    };

                    let scanner = new SQLScanner( { mode: 'fail' } );

                    try {

                        scanner.scan( event );
                    }
                    catch( err ) {

                        expect( err.message ).to.equal( 'myField is invalid' );
                        expect( err.attackType ).to.equal( test[1] );
                    }
                });

                it( 'fail: nested case - ' + test[1], function() {

                    let event = {

                        update: {
                            myField: test[0],
                        },
                        other: 'my other field'
                    };

                    let scanner = new SQLScanner( { mode: 'fail' } );

                    try {

                        scanner.scan( event );
                    }
                    catch( err ) {

                        expect( err.message ).to.equal( 'myField is invalid' );
                        expect( err.attackType ).to.equal( test[1] );
                    }
                });

                it( 'fail: ' + test[1] + ' - report only', function() {

                    let scanner = new SQLScanner( { mode: 'report' } );

                    let event = {

                        myField: test[0],
                        other: 'my other field'
                    };

                    scanner.scan( event );
                });
            });
        });
    });
});
