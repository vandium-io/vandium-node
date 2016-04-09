'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const freshy = require( 'freshy' );

const sinon = require( 'sinon' );

const configUtils = require( '../config-utils' );

process.env.LAMBDA_TASK_ROOT = require( 'app-root-path' ).path;

//var logger = require( '../../../lib/logger' ).setLevel( 'debug' );

describe( 'lib/config/index', function() {

    before( function( done ) {

        configUtils.removeConfig( done );
    });

    describe( '.config', function() {

        var config;

        beforeEach( function() {

            freshy.unload( '../../../lib/config' );

        });

        it( 'no configuration file', function( done ) {

            config = require( '../../../lib/config' );

            var updateListener = sinon.stub();

            config.on( 'update', updateListener );

            config.wait( function() {

                expect( Object.keys( config ).length ).to.equal( 2 );
                expect( config.on ).to.be.a( 'Function' );
                expect( config.wait ).to.be.a( 'Function' );

                // update will never be called because the config file is loaded during the
                // require( config )
                expect( updateListener.called ).to.be.false;

                done();
            });
        });

        it( 'simple configuration file, no s3', function( done ) {

            var configData = {

                jwt: {

                    token_name: 'bearer'
                }
            }

            configUtils.writeConfig( JSON.stringify( configData ), function( err ) {

                if( err ) {

                    return done( err );
                }

                config = require( '../../../lib/config' );

                var updateListener = sinon.stub();

                config.on( 'update', updateListener );

                config.wait( function() {

                    expect( config.on ).to.be.a( 'Function' );
                    expect( config.wait ).to.be.a( 'Function' );
                    expect( config.jwt ).to.be.an( 'Object' );
                    expect( config.jwt ).to.eql( configData.jwt );

                    // update will never be called because the config file is loaded during the
                    // require( config )
                    expect( updateListener.called ).to.be.false;

                    done();
                });
            });
        });

        it( 'call config.wait when already loaded', function( done ) {

            config = require( '../../../lib/config' );

            config.wait( function() {

                config.wait( function() {

                    done();
                });
            });
        });

        it( 'configuration file with "wait" and "on" properties', function( done ) {

            var configData = {

                on: 'this is on',
                wait: 'this is wait'
            };

            configUtils.writeConfig( JSON.stringify( configData ), function( err ) {

                if( err ) {

                    return done( err );
                }

                config = require( '../../../lib/config' );

                var updateListener = sinon.stub();

                config.on( 'update', updateListener );

                config.wait( function() {

                    expect( Object.keys( config ).length ).to.equal( 2 );
                    expect( config.on ).to.be.a( 'Function' );
                    expect( config.wait ).to.be.a( 'Function' );

                    // update will never be called because the config file is loaded during the
                    // require( config )
                    expect( updateListener.called ).to.be.false;

                    done();
                });
            });
        });

        it( 'configuration file with environment variables', function( done ) {

            const existingKey = 'TEST_EXISTING_' + Date.now();

            const newEnvKey = 'TEST_NEW_' + Date.now();

            const nullEnvKey = 'TEST_NULL_' + Date.now();

            process.env[ existingKey ] = 'Existing';

            let env = {};

            env[ existingKey ] = 'Updated';
            env[ newEnvKey ] = 'New';
            env[ nullEnvKey ] = null;

            let configData = {

                env
            };

            configUtils.writeConfig( JSON.stringify( configData ), function( err ) {

                if( err ) {

                    return done( err );
                }

                config = require( '../../../lib/config' );

                // make sure existing value was not updated
                expect( process.env[ existingKey ] ).to.equal( 'Existing' );

                // our key was added
                expect( process.env[ newEnvKey ] ).to.equal( 'New' );

                done();
            });
        });

        it( 'simple configuration file with s3 refer', function( done ) {

            freshy.unload( 'aws-sdk' );
            freshy.unload( '../../../lib/config/s3' );

            var AWS = require( 'aws-sdk' );

            let getObjectStub = sinon.stub();

            AWS.S3.prototype.getObject = sinon.spy( getObjectStub );

            var s3Data = {

                jwt: {

                    token_name: 'bearer'
                }
            }

            getObjectStub.yieldsAsync( null, { Body: JSON.stringify( s3Data ) } );

            var configData = {

                s3: {

                    bucket: 'TheBucket',
                    key: 'TheKey'
                }
            }

            configUtils.writeConfig( JSON.stringify( configData ), function( err ) {

                if( err ) {

                    return done( err );
                }

                config = require( '../../../lib/config' );

                var updateListener = sinon.stub();

                config.on( 'update', updateListener );

                config.wait( function() {

                    expect( Object.keys( config ).length ).to.equal( 4 );
                    expect( config.on ).to.be.a( 'Function' );
                    expect( config.wait ).to.be.a( 'Function' );
                    expect( config.jwt ).to.be.an( 'Object' );
                    expect( config.jwt ).to.eql( s3Data.jwt );
                    expect( config.s3 ).to.be.an( 'Object' );

                    // never called for file, but called for s3
                    expect( updateListener.calledOnce ).to.be.true;

                    done();
                });
            });
        });

        it( 'configuration file with error condition', function( done ) {

            freshy.unload( 'aws-sdk' );
            freshy.unload( '../../../lib/config/s3' );

            let AWS = require( 'aws-sdk' );

            configUtils.writeConfig( "bad", function( err ) {

                if( err ) {

                    return done( err );
                }

                config = require( '../../../lib/config' );

                var updateListener = sinon.stub();

                config.on( 'update', updateListener );

                config.wait( function() {

                    expect( Object.keys( config ).length ).to.equal( 2 );
                    expect( config.on ).to.be.a( 'Function' );
                    expect( config.wait ).to.be.a( 'Function' );

                    expect( updateListener.called ).to.be.false;

                    done();
                });
            });
        });

        it( 'configuration file with s3 error condition', function( done ) {

            freshy.unload( 'aws-sdk' );
            freshy.unload( '../../../lib/config/s3' );

            let AWS = require( 'aws-sdk' );

            let getObjectStub = sinon.stub();

            AWS.S3.prototype.getObject = sinon.spy( getObjectStub );

            getObjectStub.yieldsAsync( new Error( 'bang' ) );

            let configData = {

                s3: {

                    bucket: 'TheBucket',
                    key: 'TheKey'
                }
            }

            configUtils.writeConfig( JSON.stringify( configData ), function( err ) {

                if( err ) {

                    return done( err );
                }

                config = require( '../../../lib/config' );

                var updateListener = sinon.stub();

                config.on( 'update', updateListener );

                config.wait( function() {

                    expect( Object.keys( config ).length ).to.equal( 3 );
                    // expect( config.on ).to.be.a( 'Function' );
                    // expect( config.wait ).to.be.a( 'Function' );
                    // expect( config.jwt ).to.be.an( 'Object' );
                    // expect( config.jwt ).to.eql( s3Data.jwt );
                    // expect( config.s3 ).to.be.an( 'Object' );

                    expect( updateListener.called ).to.be.false;

                    done();
                });
            });
        });
    });

    after( function( done ) {

        freshy.unload( 'aws-sdk' );
        freshy.unload( '../../../lib/config/s3' );

        configUtils.removeConfig( done );
    });
});
