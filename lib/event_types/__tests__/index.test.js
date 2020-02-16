const { expect } = require( 'chai' );

const moduleIndex = require( '../index' );

describe( 'lib/event_types/index', function() {

  describe( '.handlerTypes', function() {

    it( 'normal operation', function() {


    });
  });

  describe( '.eventTypes', function() {

    const { eventTypes } = moduleIndex;

    it( 'normal operation', function() {

      // specialized case(s)
      const { api } = require( '../api' );

      expect( eventTypes.api ).to.equal( api );

      [
        // record types
        's3',
        'dynamodb',
        'sns',
        'ses',
        'kinesis',

        // basic types
        'cloudformation',
        'logs',
        'cognito',
        'lex',
        'scheduled'

      ].forEach( ( type ) => {

        expect( eventTypes[ type ] ).to.exist;
        expect( eventTypes[ type ] ).to.be.a( 'function' );

        const handler = eventTypes[ type ]( function() {} );

        expect( handler ).to.be.a( 'function' );
      });
    });
  });
});
