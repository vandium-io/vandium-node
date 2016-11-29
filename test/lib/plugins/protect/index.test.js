'use strict';

/*jshint expr: true*/

const envRestorer = require( 'env-restorer' );

const expect = require( 'chai' ).expect;

const MODULE_PATH = 'lib/plugins/protect/index';

const ProtectPlugin = require( '../../../../' + MODULE_PATH );

describe( MODULE_PATH, function() {

    describe( 'ProtectPlugin', function() {

        describe( 'constructor', function() {

            beforeEach( function() {

                delete process.env.VANDIUM_PROTECT;
            });

            afterEach( function() {

                envRestorer.restore();
            });

            it( 'process.env.VANDIUM_PROTECT not set', function() {

                let protect = new ProtectPlugin();

                expect( protect.name ).to.equal( 'protect' );

                expect( protect.engines ).to.exist;
                expect( protect.engines.sql ).to.exist;

                expect( protect.state ).to.eql( { sql: { enabled: true, mode: 'report', lambdaProxy: false } } );
            });

            [
                [ 'yes', { sql: { enabled: true, mode: 'fail', lambdaProxy: false } } ],
                [ 'on', { sql: { enabled: true, mode: 'fail', lambdaProxy: false } } ],
                [ 'true', { sql: { enabled: true, mode: 'fail', lambdaProxy: false } } ],
                [ 'no', { sql: { enabled: false } } ],
                [ 'off', { sql: { enabled: false } } ],
                [ 'false', { sql: { enabled: false } } ],
                [ 'report', { sql: { enabled: true, mode: 'report', lambdaProxy: false } } ],
                [ 'unknown-value', { sql: { enabled: true, mode: 'report', lambdaProxy: false } } ]
            ].forEach( function( testCase ) {

                it( 'process.env.VANDIUM_PROTECT = ' + testCase[0], function() {

                    process.env.VANDIUM_PROTECT = testCase[0];

                    let protect = new ProtectPlugin();

                    expect( protect.name ).to.equal( 'protect' );

                    expect( protect.engines ).to.exist;
                    expect( protect.engines.sql ).to.exist;

                    expect( protect.state ).to.eql( testCase[1] );
                });

                it( 'process.env.VANDIUM_PROTECT = ' + testCase[0].toUpperCase(), function() {

                    process.env.VANDIUM_PROTECT = testCase[0].toUpperCase();

                    let protect = new ProtectPlugin();

                    expect( protect.name ).to.equal( 'protect' );

                    expect( protect.engines ).to.exist;
                    expect( protect.engines.sql ).to.exist;

                    expect( protect.state ).to.eql( testCase[1] );
                });
            });
        });

        describe( '.disable', function() {

            it( 'disable sql', function() {

                let protect = new ProtectPlugin();

                expect( protect.sql.state.enabled ).to.be.true;

                protect.disable( 'sql' );

                expect( protect.sql.state ).to.eql( { enabled: false } );
                expect( protect.state ).to.eql( { sql: { enabled: false } } );
            });

            it( 'disable unknown engine', function() {

                let protect = new ProtectPlugin();

                expect( protect.sql.state.enabled ).to.be.true;

                protect.disable( 'special' );

                expect( protect.sql.state.enabled ).to.be.true;
            });

            it( 'disable all', function() {

                let protect = new ProtectPlugin();

                expect( protect.sql.state.enabled ).to.be.true;

                protect.disable();

                expect( protect.sql.state ).to.eql( { enabled: false } );
                expect( protect.state ).to.eql( { sql: { enabled: false } } );
            });
        });

        describe( '.configure', function() {

            it( 'empty configuration, newly created instance', function() {

                let protect = new ProtectPlugin();

                expect( protect.state ).to.eql( { sql: { enabled: true, mode: 'report', lambdaProxy: false } } );

                protect.configure( {} );

                expect( protect.state ).to.eql( { sql: { enabled: true, mode: 'report', lambdaProxy: false } } );
            });

            it( 'empty configuration, disabled instance', function() {

                let protect = new ProtectPlugin();

                protect.disable();

                expect( protect.state ).to.eql( { sql: { enabled: false} } );

                protect.configure( {} );

                expect( protect.state ).to.eql( { sql: { enabled: true, mode: 'report', lambdaProxy: false } } );
            });

            it( 'missing configuration, newly created instance', function() {

                let protect = new ProtectPlugin();

                expect( protect.state ).to.eql( { sql: { enabled: true, mode: 'report', lambdaProxy: false } } );

                protect.configure();

                expect( protect.state ).to.eql( { sql: { enabled: true, mode: 'report', lambdaProxy: false } } );
            });

            it( 'missing configuration, disabled instance', function() {

                let protect = new ProtectPlugin();

                protect.disable();

                expect( protect.state ).to.eql( { sql: { enabled: false} } );

                protect.configure();

                expect( protect.state ).to.eql( { sql: { enabled: true, mode: 'report', lambdaProxy: false } } );
            });

            it( 'configuration = { mode: "fail" }', function() {

                let protect = new ProtectPlugin();

                expect( protect.state ).to.eql( { sql: { enabled: true, mode: 'report', lambdaProxy: false } } );

                protect.configure( { mode: 'fail' } );

                expect( protect.state ).to.eql( { sql: { enabled: true, mode: 'fail', lambdaProxy: false } } );
            });

            it( 'configuration = { mode: "disabled" }', function() {

                let protect = new ProtectPlugin();

                expect( protect.state ).to.eql( { sql: { enabled: true, mode: 'report', lambdaProxy: false } } );

                protect.configure( { mode: 'disabled' } );

                expect( protect.state ).to.eql( { sql: { enabled: false } } );
            });

            it( 'configuration = { mode: "report" }', function() {

                let protect = new ProtectPlugin();

                protect.disable();

                expect( protect.state ).to.eql( { sql: { enabled: false } } );

                protect.configure( { mode: 'report' } );

                expect( protect.state ).to.eql( { sql: { enabled: true, mode: 'report', lambdaProxy: false } } );
            });

            it( 'configuration = { mode: "unknown-value" }', function() {

                let protect = new ProtectPlugin();

                protect.disable();

                expect( protect.state ).to.eql( { sql: { enabled: false } } );

                protect.configure( { mode: 'unknown-value' } );

                expect( protect.state ).to.eql( { sql: { enabled: true, mode: 'report', lambdaProxy: false } } );
            });

            it( 'configuration = { sql: { mode: "fail" } }', function() {

                let protect = new ProtectPlugin();

                expect( protect.state ).to.eql( { sql: { enabled: true, mode: 'report', lambdaProxy: false } } );

                protect.configure( { sql: { mode: "fail" } } );

                expect( protect.state ).to.eql( { sql: { enabled: true, mode: 'fail', lambdaProxy: false } } );
            });

            it( 'configuration = { sql: { mode: "fail", lambdaProxy: true } }', function() {

                let protect = new ProtectPlugin();

                expect( protect.state ).to.eql( { sql: { enabled: true, mode: 'report', lambdaProxy: false } } );

                protect.configure( { sql: { mode: "fail", lambdaProxy: true } } );

                expect( protect.state ).to.eql( { sql: { enabled: true, mode: 'fail', lambdaProxy: true } } );
            });

            it( 'configuration = { lambdaProxy: true, sql: { mode: "fail" } }', function() {

                let protect = new ProtectPlugin();

                expect( protect.state ).to.eql( { sql: { enabled: true, mode: 'report', lambdaProxy: false } } );

                protect.configure( { lambdaProxy: true, sql: { mode: "fail" } } );

                expect( protect.state ).to.eql( { sql: { enabled: true, mode: 'fail', lambdaProxy: true } } );
            });
        });

        describe( '.getConfiguration', function() {

            it( 'normal operation', function() {

                let protect = new ProtectPlugin();

                protect.configure( { mode: 'report' } );
                expect( protect.getConfiguration() ).to.eql( { mode: 'report' } );

                protect.configure( { mode: 'disabled' } );
                expect( protect.getConfiguration() ).to.eql( { mode: 'disabled' } );

                protect.configure( { mode: 'fail' } );
                expect( protect.getConfiguration() ).to.eql( { mode: 'fail' } );
            });
        });

        describe( '.execute', function() {

            it( 'no attack', function( done ) {

                let event = {

                    myField: "nothin' exciting"
                };

                let protect = new ProtectPlugin();

                protect.sql.fail();

                protect.execute( { event }, function( err ) {

                    done( err );
                });
            });

            it( 'potential attack', function( done ) {

                let event = {

                    myField: "1';drop table user;"
                };

                let protect = new ProtectPlugin();

                protect.sql.fail();

                protect.execute( { event }, function( err ) {

                    expect( err.message ).to.equal( 'validation error: myField is invalid' );

                    done();
                });
            });
        });
    });
});
