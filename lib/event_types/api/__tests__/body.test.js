/*jshint expr: true*/

const { expect } = require( 'chai' );

const bodyProcessor = require( '../body' );

describe( 'lib/event_types/api/body', function() {

    describe( './processResult', function() {

        const { processBody } = bodyProcessor;

        it( 'auto encoding [not specified], string value', function() {

            const result = processBody( 'string value' );

            expect( result ).to.equal( 'string value' );
        });

        it( 'auto encoding, string value', function() {

            const result = processBody( 'string value', 'auto' );

            expect( result ).to.equal( 'string value' );
        });

        it( 'auto encoding, object', function() {

            const obj = { one: 1, two: 'II', three: '3!' };

            const body = JSON.stringify( obj );

            const result = processBody( body, 'auto' );

            expect( result ).to.eql( obj );
        });

        it( 'auto encoding, object, malformed', function() {

            const obj = { one: 1, two: 'II', three: '3!' };

            const body = JSON.stringify( obj ) + '!!!';

            const result = processBody( body, 'auto' );

            // should keep the same (cannot parse)
            expect( result ).to.eql( body );
        });

        it( 'auto encoding, formURLEncoded', function() {

            const obj = { one: 1, two: 'II', three: '3!' };

            const body = 'key1=value1&key2=value2';

            const result = processBody( body, 'auto' );

            // should keep the same (cannot parse)
            expect( result ).to.eql( { key1: 'value1', key2: 'value2' } );
        });

        it( 'formURLEncoded encoding, formURLEncoded', function() {

            const obj = { one: 1, two: 'II', three: '3!' };

            const body = 'key1=value1&key2=value2';

            const result = processBody( body, 'formURLEncoded' );

            expect( result ).to.eql( { key1: 'value1', key2: 'value2' } );
        });

        it( 'formURLEncoded encoding, object', function() {

            const obj = { one: 1, two: 'II', three: '3!' };

            const body = JSON.stringify( obj ) + '!!!';

            const result = processBody( body, 'formURLEncoded' );

            // should keep the same (cannot parse)
            expect( result ).to.eql( body );
        });

        it( 'formURLEncoded encoding, formURLEncoded, malformed', function() {

            const obj = { one: 1, two: 'II', three: '3!' };

            const body = 'key1@value1key2value2';

            const result = processBody( body, 'formURLEncoded' );

            expect( result ).to.eql( body );
        });

        it( 'unknown encoding, value', function() {

            const obj = { one: 1, two: 'II', three: '3!' };

            const body = JSON.stringify( obj );

            const result = processBody( body, 'special-json' );

            expect( result ).to.eql( body );
        });
    });
});
