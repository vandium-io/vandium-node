'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const file = require( '../../../lib/config/file' );

const configUtils = require( '../config-utils' );

process.env.LAMBDA_TASK_ROOT = require( 'app-root-path' ).path;

describe( 'lib/config/file', function() {

    before( function( done ) {

        configUtils.removeConfig( done );
    });

    after( function( done ) {

        configUtils.removeConfig( done );
    });

    describe( '.load', function() {

        var json = {

            one: 1,
            two: 'two',
            three: 'iii'
        };

        it( 'file exists', function( done ) {

            configUtils.writeConfig( JSON.stringify( json ), function( err ) {

                if( err ) {

                    return done( err );
                }

                file.load( function( err, content ) {

                    expect( err ).to.not.exist;
                    expect( content ).to.eql( json );

                    done();
                });
            })
        });

        it( 'file does not exist', function( done ) {

            configUtils.removeConfig( function() {

                file.load( function( err, content ) {

                    expect( err ).to.not.exist;
                    expect( content ).to.eql( {} )
                    done();
                });
            })
        });
    })
});
