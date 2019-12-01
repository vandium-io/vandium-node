const { expect } = require( 'chai' );

const custom = require( '../custom' );

describe( 'lib/event_types/custom', function() {

    it( 'normal operation', function() {

        let lambda = custom();

        expect( lambda.finally ).to.exist;
        expect( lambda.finally ).to.be.a( 'function' );

        expect( lambda.handler ).to.exist;
        expect( lambda.handler ).to.be.a( 'function' );
    });
});
