'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const MODULE_PATH = 'lib/plugins/protect/sql';

const SQLScanEngine = require( '../../../../' + MODULE_PATH );

describe( MODULE_PATH, function() {

    describe( 'SQLScanEngine', function() {

        describe( 'constructor', function() {

            it( 'normal operation', function() {

                let engine = new SQLScanEngine();

                expect( engine.name ).to.equal( 'protect_sql' );
            });
        });

        describe( '.execute', function() {

            let engine;

            beforeEach( function() {

                engine = new SQLScanEngine().fail();
            });

            it( 'test normal values', function( done ) {

                var event = {

                    string1: "what's up",
                    string2: "double -- dash",
                    string3: "a union between code",
                    string4: "this sentence has union and the word select",
                    number: 1234,
                    object: { number: 123 },
                    bool: true
                };

                engine.execute( { event }, done );
            });

            it( 'regression false positive tests', function( done ) {

                var event = {

                    escapeComment1: "/details?seoName=smith---whatever-main-office"
                };

                engine.execute( { event }, done );
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

                it( 'fail: ' + test[1], function( done ) {

                    var event = {

                        myField: test[0],
                        other: 'my other field'
                    };

                    engine.execute( { event }, function( err ) {

                        expect( err.message ).to.equal( 'myField is invalid' );
                        expect( err.attackType ).to.equal( test[1] );

                        done();
                    });
                });

                it( 'fail: nested case - ' + test[1], function( done ) {

                    var event = {

                        update: {
                            myField: test[0],
                        },
                        other: 'my other field'
                    };

                    engine.execute( { event }, function( err ) {

                        expect( err.message ).to.equal( 'myField is invalid' );
                        expect( err.attackType ).to.equal( test[1] );

                        done();
                    });
                });

                it( 'fail: ' + test[1] + ' - report only', function( done ) {

                    engine.report();

                    var event = {

                        myField: test[0],
                        other: 'my other field'
                    };

                    engine.execute( { event }, done );
                });
            });
        });
    });
});
