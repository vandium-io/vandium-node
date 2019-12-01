const { expect } = require( 'chai' );

const jwtBuilder = require( 'jwt-builder' );

const token = require( '../token' );

describe( 'lib/jwt/jwt', function() {

    describe( '.decode', function() {

        it( 'valid token', function() {

            const jwtToken = jwtBuilder( { algorithm: 'HS256', secret: 'super-secret', user: 'fred', iat: true, exp: 100 } );

            let decoded = token.decode( jwtToken, 'HS256', 'super-secret' );

            expect( decoded.iat ).to.exist;
            expect( decoded.exp ).to.exist;
            expect( decoded.user ).to.equal( 'fred' );
        });

        it( 'valid token, no iat', function() {

            const jwtToken = jwtBuilder( { algorithm: 'HS256', secret: 'super-secret', user: 'fred', iat: false, exp: 100 } );

            let decoded = token.decode( jwtToken, 'HS256', 'super-secret' );

            expect( decoded.iat ).to.not.exist;
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

    describe( '.validateXSRF', function() {

        it( 'valid token', function() {

            let xsrfToken = "xsrf-" + Date.now().toString();

            let decoded = {

                stuff: 'whatever',
                nonce: xsrfToken
            };

            token.validateXSRF( decoded, xsrfToken, [ 'nonce' ] );
        });

        it( 'fail: missing token', function() {

            let decoded = {

                stuff: 'whatever',
                nonce: 'token-here'
            };

            expect( token.validateXSRF.bind( null, decoded, null, [ 'nonce' ] ) ).to.throw( 'authentication error: missing xsrf token' );
        });

        it( 'fail: missing token, xsrf', function() {

            let xsrfToken = "xsrf-" + Date.now().toString();

            let decoded = {

                stuff: 'whatever'
            };

            expect( token.validateXSRF.bind( null, decoded, xsrfToken, [ 'nonce' ] ) ).to.throw( 'authentication error: xsrf claim missing' );
        });

        it( 'fail: missing token, xsrf, nonce', function() {

            let xsrfToken = "xsrf-" + Date.now().toString();

            let decoded = {

                stuff: 'whatever',
                nonce: xsrfToken + 'x'
            };

            expect( token.validateXSRF.bind( null, decoded, xsrfToken, [ 'nonce' ] ) ).to.throw( 'authentication error: xsrf token mismatch' );
        });
    });
});
