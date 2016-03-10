'use strict';

var expect = require( 'chai' ).expect;

var freshy = require( 'freshy' );

var sinon = require( 'sinon' );

var fs = require( 'fs' );

var configUtils = require( '../config-utils' );

describe( 'lib/config/index', function() {

    var getObjectStub;
    var getObjectSpy;

    var s3Loader;

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

            var updateListener = sinon.mock();

            config.on( 'update', updateListener );

            updateListener.once();

            config.wait( function() {

                expect( Object.keys( config ).length ).to.equal( 2 );
                expect( config.on ).to.be.a( 'Function' );
                expect( config.wait ).to.be.a( 'Function' );
                
                updateListener.verify();

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

                var updateListener = sinon.mock();

                config.on( 'update', updateListener );

                updateListener.once();

                config.wait( function() {

                    expect( Object.keys( config ).length ).to.equal( 3 );
                    expect( config.on ).to.be.a( 'Function' );
                    expect( config.wait ).to.be.a( 'Function' );
                    expect( config.jwt ).to.be.an( 'Object' );
                    expect( config.jwt ).to.eql( configData.jwt );
                    
                    updateListener.verify();
                    
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

                var updateListener = sinon.mock();

                config.on( 'update', updateListener );

                updateListener.once();

                config.wait( function() {

                    expect( Object.keys( config ).length ).to.equal( 2 );
                    expect( config.on ).to.be.a( 'Function' );
                    expect( config.wait ).to.be.a( 'Function' );
                    
                    updateListener.verify();
                    
                    done();
                });                
            });
        });

        it( 'simple configuration file with s3 refer', function( done ) {

            freshy.unload( 'aws-sdk' );
            freshy.unload( '../../../lib/config/s3' );
                
            var AWS = require( 'aws-sdk' );

            getObjectStub = sinon.stub();

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

                var updateListener = sinon.mock();

                config.on( 'update', updateListener );

                updateListener.twice();

                config.wait( function() {

                    expect( Object.keys( config ).length ).to.equal( 4 );
                    expect( config.on ).to.be.a( 'Function' );
                    expect( config.wait ).to.be.a( 'Function' );
                    expect( config.jwt ).to.be.an( 'Object' );
                    expect( config.jwt ).to.eql( s3Data.jwt );
                    expect( config.s3 ).to.be.an( 'Object' );
                    
                    updateListener.verify();
                    
                    done();
                });                
            });
        });

        it( 'configuration file with error condition', function( done ) {

            freshy.unload( 'aws-sdk' );
            freshy.unload( '../../../lib/config/s3' );
                
            var AWS = require( 'aws-sdk' );

            configUtils.writeConfig( "bad", function( err ) {

                if( err ) {

                    return done( err );
                }

                config = require( '../../../lib/config' );

                var updateListener = sinon.mock();

                config.on( 'update', updateListener );

                updateListener.never();

                config.wait( function() {

                    expect( Object.keys( config ).length ).to.equal( 2 );
                    expect( config.on ).to.be.a( 'Function' );
                    expect( config.wait ).to.be.a( 'Function' );
                    
                    updateListener.verify();
                    
                    done();
                });                
            });
        });

        it( 'configuration file with s3 error condition', function( done ) {

            freshy.unload( 'aws-sdk' );
            freshy.unload( '../../../lib/config/s3' );
                
            var AWS = require( 'aws-sdk' );

            getObjectStub = sinon.stub();

            AWS.S3.prototype.getObject = sinon.spy( getObjectStub );

            getObjectStub.yieldsAsync( new Error( 'bang' ) );
            
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

                var updateListener = sinon.mock();

                config.on( 'update', updateListener );

                updateListener.once();

                config.wait( function() {

                    expect( Object.keys( config ).length ).to.equal( 3 );
                    // expect( config.on ).to.be.a( 'Function' );
                    // expect( config.wait ).to.be.a( 'Function' );
                    // expect( config.jwt ).to.be.an( 'Object' );
                    // expect( config.jwt ).to.eql( s3Data.jwt );
                    // expect( config.s3 ).to.be.an( 'Object' );
                    
                    updateListener.verify();
                    
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
