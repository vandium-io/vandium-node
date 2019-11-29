/*jshint expr: true*/

const { expect } = require( 'chai' );

const cookie = require( 'cookie' );

const cookies = require( '../cookies' );

describe( 'lib/event_types/api/cookies', function() {

    describe( '.processCookies', function() {

        const { processCookies } = cookies;

        it( 'no coookies', function() {

            const headers = {};

            const result = processCookies( headers );

            expect( result ).to.eql( {} );
        });

        it( 'invalid cookie', function() {

            const headers = {

                Cookie: 'this is a bad cookie'
            };

            const result = processCookies( headers );

            expect( result ).to.eql( {} );
        });

        it( 'invalid cookie, exception', function() {

            const headers = {

                Cookie: { f: 1  }
            };

            const result = processCookies( headers );

            expect( result ).to.eql( {} );
        });

        it( 'simple cookie', function() {

            const headers = {

                Cookie: 'cookie1=val1'
            };

            const result = processCookies( headers );

            expect( result ).to.eql( { cookie1: 'val1' } );
        });
    });

    describe( '.serializeCookies', function() {

        const { serializeCookies } = cookies;

        it( 'single cookie as string', function() {

            expect( serializeCookies( 'name=fred' ) ).to.equal( 'name=fred' );
        });

        it( 'multiple cookies as string', function() {

            expect( serializeCookies( ['name=fred', 'id=123' ] ) ).to.eql( ['name=fred', 'id=123'] );
        });

        it( 'single cookie object', function() {

            const cookieObj = {
                name: 'first',
                value: 'cookie',
                options: {
                    domain: 'domain.name',
                    encode: encodeURIComponent,
                    expires: new Date(),

                    httpOnly: true,
                    maxAge: 1000,
                    path: '/',
                    sameSite: true,
                    secure: false,
                }
            };

            const serialized = cookie.serialize( cookieObj.name, cookieObj.value, cookieObj.options );

            expect( serializeCookies( cookieObj ) ).to.equal( serialized );
        });

        it( 'mulitple cookie objects', function() {

            const cookieObj1 = {
                name: 'first',
                value: 'cookie',
                options: {
                    domain: 'domain.name',
                    encode: encodeURIComponent,
                    expires: new Date(),

                    httpOnly: true,
                    maxAge: 1000,
                    path: '/',
                    sameSite: true,
                    secure: false,
                }
            };

            const cookieObj2 = {
                name: 'first',
                value: 'cookie',
                options: {
                    domain: 'domain.name',
                    encode: encodeURIComponent,
                    expires: new Date(),

                    httpOnly: true,
                    maxAge: 1000,
                    path: '/',
                    sameSite: true,
                    secure: false,
                }
            };

            const serialized1 = cookie.serialize( cookieObj1.name, cookieObj1.value, cookieObj1.options );
            const serialized2 = cookie.serialize( cookieObj2.name, cookieObj2.value, cookieObj2.options );

            expect( serializeCookies( [ cookieObj1, cookieObj2 ] ) ).to.eql( [ serialized1, serialized2 ] );
        });
    });
});
