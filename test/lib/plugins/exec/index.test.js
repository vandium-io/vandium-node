'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const sinon = require( 'sinon' );

const MODULE_PATH = 'lib/plugins/exec/index';

const ExecPlugin = require( '../../../../' + MODULE_PATH );

describe( MODULE_PATH, function() {

    describe( 'ExecPlugin', function() {

        describe( 'constructor', function() {

            it( 'normal operation', function() {

                let plugin = new ExecPlugin();

                expect( plugin.name ).to.equal( 'exec' );
                expect( plugin.userFunc ).to.not.exist;
            });
        });

        describe( '.setUserFunc', function() {

            it( 'normal operation', function() {

                let plugin = new ExecPlugin();

                let userFunc = function() {};

                expect( plugin.userFunc ).to.not.exist;

                plugin.setUserFunc( userFunc );

                expect( plugin.userFunc ).to.equal( userFunc );
            });

            it( 'fail: when userFunc is not a function', function() {

                let plugin = new ExecPlugin();

                expect( plugin.setUserFunc.bind( plugin, 'this is not a user function!' ) ).to.throw( 'must be a function' );
            });
        });

        describe( '.state', function() {

            it( 'without user function', function() {

                let plugin = new ExecPlugin();

                expect( plugin.state ).to.eql( { configured: false } );
            });

            it( 'with user function', function() {

                let plugin = new ExecPlugin();

                plugin.setUserFunc( function() {} );

                expect( plugin.state ).to.eql( { configured: true } );
            });
        });

        describe( '.execute', function() {

            it( 'running the handler with callback( null, result )', function( done ) {

                let event = { one: 1 };

                let func = function( event, context, callback ) {

                    if( event.one !== 1 ) {

                        // should never get here
                        return callback( new Error( 'event invalid' ) );
                    }

                    callback( null, 'ok' );
                };

                let plugin = new ExecPlugin();

                plugin.setUserFunc( func );

                let context = {};

                let pipelineEvent = { event, context };

                plugin.execute( pipelineEvent, function( err, result ) {

                    if( err ) {

                        return done( err );
                    }

                    expect( result ).to.equal( 'ok' );
                    done();
                });
            });

            it( 'running the handler with callback( err )', function( done ) {

                let func = function( event, context, callback ) {

                    callback( new Error( 'bang' ) );
                };

                let event = {};

                let plugin = new ExecPlugin();

                plugin.setUserFunc( func );

                let context = {};

                let pipelineEvent = { event, context };

                plugin.execute( pipelineEvent, function( err, result ) {

                    expect( err ).to.exist;
                    expect( err.message ).to.equal( 'bang' );

                    expect( result ).to.not.exist;

                    done();
                });
            });

            it( 'running the handler with callback( string )', function( done ) {

                let func = function( event, context, callback ) {

                    callback( 'bang' );
                };

                let event = {};

                let plugin = new ExecPlugin();

                plugin.setUserFunc( func );

                let context = {};

                let pipelineEvent = { event, context };

                plugin.execute( pipelineEvent, function( err, result ) {

                    expect( err ).to.exist;
                    expect( err ).to.equal( 'bang' );

                    expect( result ).to.not.exist;

                    done();
                });
            });

            it( 'running the handler returning Promise.resolve()', function( done ) {

                let func = function() {

                    return Promise.resolve( 'ok' );
                };

                let event = {};

                let plugin = new ExecPlugin();

                plugin.setUserFunc( func );

                let context = {};

                let pipelineEvent = { event, context };

                plugin.execute( pipelineEvent, function( err, result ) {

                    expect( err ).to.be.null;
                    expect( result ).to.equal( 'ok' );

                    done();
                });
            });

            it( 'running the handler returning Promise.reject()', function( done ) {

                let func = function() {

                    return Promise.reject( new Error( 'bang' ) );
                };

                let event = {};

                let plugin = new ExecPlugin();

                plugin.setUserFunc( func );

                let context = {};

                let pipelineEvent = { event, context };

                plugin.execute( pipelineEvent, function( err, result ) {

                    expect( err ).to.exist;
                    expect( err.message ).to.equal( 'bang' );

                    expect( result ).to.be.undefined;

                    done();
                });
            });

            it( 'running the handler, synchronous return', function( done ) {

                let func = function() {

                    return 'ok';
                };


                let event = {};

                let plugin = new ExecPlugin();

                plugin.setUserFunc( func );

                let context = {};

                let pipelineEvent = { event, context };

                plugin.execute( pipelineEvent, function( err, result ) {

                    expect( err ).to.be.null;
                    expect( result ).to.equal( 'ok' );

                    done();
                });
            });

            it( 'fail: when user function is not set', function( done ) {

                let event = {};

                let plugin = new ExecPlugin();

                let context = {};

                let pipelineEvent = { event, context };

                plugin.execute( pipelineEvent, function( err ) {

                    expect( err ).to.exist;

                    done();
                });
            });

            it( 'fail: when context is not set', function( done ) {

                let func = function() {

                    return 'ok';
                };

                let event = {};

                let plugin = new ExecPlugin();

                plugin.setUserFunc( func );

                let pipelineEvent = { event };

                plugin.execute( pipelineEvent, function( err ) {

                    expect( err ).to.exist;

                    done();
                });
            });
        });
    });
});
