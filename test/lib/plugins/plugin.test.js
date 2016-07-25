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
    });
});
