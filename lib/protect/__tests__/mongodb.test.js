const { expect } = require( 'chai' );

const MODULE_PATH = 'lib/protect/mongodb';

const MongoDBScanner = require( '../mongodb' );

describe( MODULE_PATH, function() {

    describe( 'MongoDBScanner', function() {

        describe( 'constructor', function() {

            it( 'no options', function() {

                let scanner = new MongoDBScanner();

                expect( scanner.enabled ).to.be.true;
                expect( scanner.mode ).to.equal( 'report' );
            });

            it( 'mode = disabled', function() {

                let scanner = new MongoDBScanner( { mode: 'disabled' } );

                expect( scanner.enabled ).to.be.false;
                expect( scanner.mode ).to.not.exist;
            });

            [
                [ 'report', 'report' ],
                [ 'fail', 'fail' ],
                [ 'whatever', 'report' ]

            ].forEach( (test) => {

                it( `mode = ${test[0]}`, function() {

                    let scanner = new MongoDBScanner( { mode: test[0] } );

                    expect( scanner.enabled ).to.be.true;
                    expect( scanner.mode ).to.equal( test[1] );
                });
            })
        });

        describe( '.scan', function() {

            it( 'test normal values', function() {

                let scanner = new MongoDBScanner( { mode: 'fail' } );

                let values = {

                    string1: "what's up",
                    string2: "double -- dash",
                    string3: "a union between code",
                    string4: "this sentence has union and the word select",
                    number: 1234,
                    object: { number: 123 },
                    bool: true
                };

                scanner.scan( values );
            });

            [
                [ { user: 'user1', password: { $gte: 0 } }, 'INJECTION_ATTACK' ],

            ].forEach( function( test ) {

                it( 'fail: ' + test[1], function() {

                    let values = test[0];

                    let scanner = new MongoDBScanner( { mode: 'fail' } );

                    try {

                        scanner.scan( values );
                    }
                    catch( err ) {

                        expect( err.message ).to.equal( 'password is invalid' );
                        expect( err.attackType ).to.equal( test[1] );
                    }
                });

                it( 'fail: ' + test[1] + ' - report only', function() {

                    let scanner = new MongoDBScanner( { mode: 'report' } );

                    let values = test[0];

                    scanner.scan( values );
                });
            });
        });
    });
});
