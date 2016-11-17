'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const proxyquire = require( 'proxyquire' ).noCallThru();

const sinon = require( 'sinon' );

const configUtils = require( '../config-utils' );

const MODULE_PATH = 'lib/config/index';

//var logger = require( '../../../lib/logger' ).setLevel( 'debug' );

describe( MODULE_PATH, function() {

    let s3Stub;

    let configModule;

    beforeEach( function() {

        configUtils.removeConfig();

        s3Stub = {

            load: sinon.stub()
        }

        configModule = proxyquire( '../../../' + MODULE_PATH, {

                './s3': s3Stub
            });
    });

    after( function() {

        configUtils.removeConfig();
    });

    describe( 'Configuration', function() {

        describe( 'constructor (via .create)', function() {

            it( 'normal operation', function() {

                let config = configModule.create();

                expect( config._loaded ).to.be.false;
            });
        });

        describe( '.load', function() {

            it( 'no configuration file', function() {

                let config = configModule.create();

                config.load();

                expect( config._loaded ).to.be.true;

                expect( config.get() ).to.eql( {} );
            });

            it( 'simple configuration file, no s3', function( done ) {

                var configData = {

                    jwt: {

                        token_name: 'bearer'
                    }
                }

                configUtils.writeConfig( JSON.stringify( configData ) );

                let config = configModule.create();

                config.on( 'update', function() {

                    expect( config.get() ).to.eql( configData );

                    process.nextTick( done );
                });

                config.load();

                expect( config._loaded ).to.be.true;
            });

            it( 'simple configuration file, path provided, no s3', function() {

                var configData = {

                    jwt: {

                        token_name: 'bearer'
                    }
                }

                configUtils.writeConfig( JSON.stringify( configData ) );

                let config = configModule.create();

                config.load( configUtils.path );

                expect( config._loaded ).to.be.true;

                expect( config.get() ).to.eql( configData );
            });

            it( 'simple configuration file with s3 refer', function() {

                var s3Data = {

                    jwt: {

                        token_name: 'bearer'
                    }
                }

                s3Stub.load.returns( Promise.resolve( s3Data ) );

                var configData = {

                    s3: {

                        bucket: 'TheBucket',
                        key: 'TheKey'
                    }
                }

                configUtils.writeConfig( JSON.stringify( configData ) );

                let config = configModule.create();

                let loadPromise = config.load();

                expect( loadPromise ).to.exist;
                expect( loadPromise.then ).to.exist;

                expect( config.isLoaded() ).to.be.false;

                return loadPromise
                    .then( function() {

                        expect( config.isLoaded() ).to.be.true;

                        expect( config.get().jwt ).to.eql( s3Data.jwt );
                    });
            });

            it( 'simple configuration file with s3 refer, s3 errors out', function() {

                s3Stub.load.returns( Promise.reject( new Error( 'bang' ) ) );

                var configData = {

                    s3: {

                        bucket: 'TheBucket',
                        key: 'TheKey'
                    }
                }

                configUtils.writeConfig( JSON.stringify( configData ) );

                let config = configModule.create();

                let loadPromise = config.load();

                expect( loadPromise ).to.exist;
                expect( loadPromise.then ).to.exist;

                expect( config.isLoaded() ).to.be.false;

                return loadPromise
                    .then( function() {

                        expect( config.isLoaded() ).to.be.true;

                        expect( config.get() ).to.eql( configData );
                    });
            });
        });
    });
});
