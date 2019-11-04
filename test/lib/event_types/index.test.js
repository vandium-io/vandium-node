'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const eventTypes = require( '../../../lib/event_types/index' );

describe( 'lib/event_types/index', function() {

    describe( '.api', function() {

        it( 'normal operation', function() {

            let api = require( '../../../lib/event_types/api' );

            expect( eventTypes.api ).to.equal( api );
        });
    });

    // record types
    [
        's3',
        'dynamodb',
        'sns',
        'ses',
        'kinesis'

    ].forEach( ( type ) => {
        describe( `.${type}`, function() {

            it( 'normal operation', function() {

                expect( eventTypes[ type ] ).to.exist;
                expect( eventTypes[ type ] ).to.be.a( 'function' );

                let handler = eventTypes[ type ]( function() {} );

                expect( handler ).to.be.a( 'function' );
            });
        });
    });

    // basic types
    [
        'cloudformation',
        'logs',
        'cognito',
        'lex',
        'scheduled'

    ].forEach( ( type ) => {

        describe( `.${type}`, function() {

            it( 'normal operation', function() {

                expect( eventTypes[ type ] ).to.exist;
                expect( eventTypes[ type ] ).to.be.a( 'function' );

                let handler = eventTypes[ type ]( function() {} );

                expect( handler ).to.be.a( 'function' );
            });
        });
    });
});
