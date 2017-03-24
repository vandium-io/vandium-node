'use strict';

/*jshint expr: true*/

var expect = require( 'chai' ).expect;

const MODULE_PATH = 'lib/event_types/api/index';

const apiHandler = require( '../../../../' + MODULE_PATH );

describe( MODULE_PATH, function() {

    describe( 'handler', function() {

        it( 'normal operation', function( done ) {

            let handler = apiHandler();

            console.log( handler );

            handler.GET( {}, function() {});
            handler.put( {}, function() {});
            handler.DELETE( {}, function() {});

            handler( {}, {}, done );
        });
    });
});
