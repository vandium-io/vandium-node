'use strict';

/*jshint expr: true*/

var expect = require( 'chai' ).expect;

const Plugin = require( '../../../lib/plugins/plugin' );

describe( 'lib/plugins/plugin', function() {

    describe( 'Plugin', function() {

        describe( 'constructor', function() {

            it( 'normal operation', function() {

                let plugin = new Plugin( 'test' );

                expect( plugin.name ).to.equal( 'test' );
            });
        });

        describe( '.configure', function() {

            it( 'normal operation', function() {

                let plugin = new Plugin( 'test' );

                plugin.configure( {} );

                expect( plugin ).to.eql( { name: 'test' } );

                plugin.configure();

                expect( plugin ).to.eql( { name: 'test' } );

                plugin.configure( { whatever: true } );

                expect( plugin ).to.eql( { name: 'test' } );
            });
        });

        describe( '.getConfiguration', function() {

            it( 'normal operation', function() {

                let plugin = new Plugin( 'test' );
                expect( plugin.getConfiguration() ).to.eql( {} );

                plugin.configure( {} );
                expect( plugin.getConfiguration() ).to.eql( {} );
            });
        });

        describe( '.execute', function() {

            it( 'normal operation', function( done ) {

                let plugin = new Plugin( 'test' );

                plugin.execute( {}, function( err, result ) {

                    expect( err ).to.not.exist;
                    expect( result ).to.not.exist;

                    done( err );
                });
            });
        });
    });
});
