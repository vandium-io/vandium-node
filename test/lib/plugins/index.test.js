'use strict';

/*jshint expr: true*/

var expect = require( 'chai' ).expect;

const plugins = require( '../../../lib/plugins/index' );

describe( 'lib/plugins/index', function() {

    describe( 'module.exports', function() {

        it( 'normal operation', function() {

            expect( plugins.Plugin ).to.exist;
            expect( plugins.Plugin  .name ).to.equal( 'Plugin' );

            expect( plugins.ValidationPlugin ).to.exist;
            expect( plugins.ValidationPlugin.name ).to.equal( 'ValidationPlugin' );

            expect( plugins.JWTPlugin ).to.exist;
            expect( plugins.JWTPlugin.name ).to.equal( 'JWTPlugin' );

            expect( plugins.ProtectPlugin ).to.exist;
            expect( plugins.ProtectPlugin.name ).to.equal( 'ProtectPlugin' );

            expect( plugins.ExecPlugin ).to.exist;
            expect( plugins.ExecPlugin.name ).to.equal( 'ExecPlugin' );
        });
    });
});
