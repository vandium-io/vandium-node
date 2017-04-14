'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const jwtBuilder = require( 'jwt-builder' );

const token = require( '../../../lib/jwt/token' );

describe( 'lib/jwt/jwt', function() {

    describe( '.decode', function() {

        it( 'valid token', function() {

            const jwtToken = jwtBuilder( { algorithm: 'HS256', secret: 'super-secret', user: 'fred', iat: true, exp: 100 } );

            let decoded = token.decode( jwtToken, 'HS256', 'super-secret' );

            expect( decoded.iat ).to.exist;
            expect( decoded.exp ).to.exist;
            expect( decoded.user ).to.equal( 'fred' );
        });

        it( 'fail when invalid algorithm is used', function() {

            const jwtToken = jwtBuilder( { algorithm: 'HS256', secret: 'super-secret', user: 'fred', iat: true, exp: 100 } );

            expect( token.decode.bind( null, jwtToken, 'HS384', 'super-secret' ) ).to.throw( 'authentication error: Signature verification failed' );
        });

        it( 'fail when invalid key is used', function() {

            const jwtToken = jwtBuilder( { algorithm: 'HS256', secret: 'super-secret', user: 'fred', iat: true, exp: 100 } );

            expect( token.decode.bind( null, jwtToken, 'HS256', 'other-super-secret' ) ).to.throw( 'authentication error: Signature verification failed' );
        });

        it( 'fail when token is expired', function( done ) {

            const jwtToken = jwtBuilder( { algorithm: 'HS256', secret: 'super-secret', user: 'fred', iat: true, exp: 1 } );

            setTimeout( () => {

                try {

                    expect( token.decode.bind( null, jwtToken, 'HS256', 'super-secret' ) ).to.throw( 'authentication error: Token expired' );

                    done();
                }
                catch( err ) {

                    done( err );
                }
            }, 1001 );
        });

        it( 'fail when token issued at date is after current time', function() {

            const jwtToken = jwtBuilder( { algorithm: 'HS256', secret: 'super-secret', user: 'fred', iat: 100, exp: 100 } );

            expect( token.decode.bind( null, jwtToken, 'HS256', 'super-secret' ) ).to.throw( 'authentication error: token used before issue date' );
        });
    });
});
