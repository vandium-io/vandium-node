'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const sinon = require( 'sinon' );

const jwtBuilder = require( 'jwt-builder' );

const validator = require( '../../../../lib/plugins/jwt/validator' );

const uuid = require( 'node-uuid' );

//const token = jwtBuilder( { algorithm: 'HS256', secret: 'super-secret', user: 'fred' } );

describe( 'lib/plugins/jwt/validator', function() {

    let configuration;

    beforeEach( function() {

        configuration = {

            isEnabled: sinon.stub().returns( true ),

            resolve: sinon.stub()
        };
    });

    describe( '.validate', function() {

        it( 'basic token', function() {

            const token = jwtBuilder( { algorithm: 'HS256', secret: 'super-secret', user: 'fred' } );

            const config = { algorithm: 'HS256', key: 'super-secret', tokenName: 'jwt', xsrf: false };

            let event = { jwt: token };

            configuration.resolve.returns( config );

            validator.validate( event, configuration );

            expect( event.jwt.token ).to.equal( token );
            expect( event.jwt.claims ).to.eql( { user: 'fred' } );

            expect( configuration.isEnabled.calledOnce ).to.be.true;
            expect( configuration.isEnabled.withArgs().calledOnce ).to.be.true;

            expect( configuration.resolve.calledOnce ).to.be.true;
            expect( configuration.resolve.withArgs( event /* note: event object updated */ ).calledOnce ).to.be.true;
        });

        it( 'token with iat and exp', function() {

            const token = jwtBuilder( { algorithm: 'HS256', secret: 'super-secret', user: 'fred', iat: true, exp: 100 } );

            const config = { algorithm: 'HS256', key: 'super-secret', tokenName: 'jwt', xsrf: false };

            let event = { jwt: token };

            configuration.resolve.returns( config );

            validator.validate( event, configuration );

            expect( event.jwt.token ).to.equal( token );
            expect( event.jwt.claims.user ).to.equal( 'fred' );
            expect( event.jwt.claims.iat ).to.exist;
            expect( event.jwt.claims.exp ).to.exist;

            expect( configuration.isEnabled.calledOnce ).to.be.true;
            expect( configuration.isEnabled.withArgs().calledOnce ).to.be.true;

            expect( configuration.resolve.calledOnce ).to.be.true;
            expect( configuration.resolve.withArgs( event /* note: event object updated */ ).calledOnce ).to.be.true;
        });

        it( 'token with iat, nbf and exp', function() {

            const token = jwtBuilder( { algorithm: 'HS256', secret: 'super-secret', user: 'fred', iat: true, exp: 100, nbf: true } );

            const config = { algorithm: 'HS256', key: 'super-secret', tokenName: 'jwt', xsrf: false };

            let event = { jwt: token };

            configuration.resolve.returns( config );

            validator.validate( event, configuration );

            expect( event.jwt.token ).to.equal( token );
            expect( event.jwt.claims.user ).to.equal( 'fred' );
            expect( event.jwt.claims.iat ).to.exist;
            expect( event.jwt.claims.exp ).to.exist;

            expect( configuration.isEnabled.calledOnce ).to.be.true;
            expect( configuration.isEnabled.withArgs().calledOnce ).to.be.true;

            expect( configuration.resolve.calledOnce ).to.be.true;
            expect( configuration.resolve.withArgs( event /* note: event object updated */ ).calledOnce ).to.be.true;
        });

        it( 'token with xsrf', function() {

            const xsrfToken = uuid.v4();

            const token = jwtBuilder( { algorithm: 'HS256', secret: 'super-secret', user: 'fred', xsrf: xsrfToken } );

            const config = {

                algorithm: 'HS256',
                key: 'super-secret',
                tokenName: 'jwt',
                xsrfTokenName: 'xsrfToken',
                xsrfClaimName: 'xsrf',
                xsrf: true };

            let event = { jwt: token, xsrfToken };

            configuration.resolve.returns( config );

            validator.validate( event, configuration );

            expect( event.jwt.token ).to.equal( token );
            expect( event.jwt.claims ).to.eql( { user: 'fred', xsrf: xsrfToken } );

            expect( configuration.isEnabled.calledOnce ).to.be.true;
            expect( configuration.isEnabled.withArgs().calledOnce ).to.be.true;

            expect( configuration.resolve.calledOnce ).to.be.true;
            expect( configuration.resolve.withArgs( event /* note: event object updated */ ).calledOnce ).to.be.true;
        });

        it( 'configuration not enabled', function() {

            configuration.isEnabled.returns( false );

            validator.validate( {}, configuration );

            expect( configuration.isEnabled.calledOnce ).to.be.true;
            expect( configuration.isEnabled.withArgs().calledOnce ).to.be.true;

            expect( configuration.resolve.called ).to.be.false;
        });

        it( 'fail: jwt token missing', function() {

            const config = {

                algorithm: 'HS256',
                key: 'super-secret',
                tokenName: 'jwt',
                xsrfTokenName: 'xsrfToken',
                xsrfClaimName: 'xsrf',
                xsrf: true };

            let event = { /* no token */ };

            configuration.resolve.returns( config );

            expect( validator.validate.bind( validator, event, configuration ) ).to.throw( 'authentication error: missing jwt token' );

            expect( event ).to.eql( {} );

            expect( configuration.isEnabled.calledOnce ).to.be.true;
            expect( configuration.isEnabled.withArgs().calledOnce ).to.be.true;

            expect( configuration.resolve.calledOnce ).to.be.true;
            expect( configuration.resolve.withArgs( event /* note: event object updated */ ).calledOnce ).to.be.true;
        });

        it( 'fail: nbf in the future', function() {

            const xsrfToken = uuid.v4();

            const token = jwtBuilder( { algorithm: 'HS256', secret: 'super-secret', user: 'fred', xsrf: xsrfToken, nbf: 100 } );

            const config = {

                algorithm: 'HS256',
                key: 'super-secret',
                tokenName: 'jwt',
                xsrfTokenName: 'xsrfToken',
                xsrfClaimName: 'xsrf',
                xsrf: true };

            let event = { jwt: token, xsrfToken };

            configuration.resolve.returns( config );

            expect( validator.validate.bind( validator, event, configuration ) ).to.throw( 'authentication error: Token not yet active' );

            expect( event.jwt ).to.equal( token );

            expect( configuration.isEnabled.calledOnce ).to.be.true;
            expect( configuration.isEnabled.withArgs().calledOnce ).to.be.true;

            expect( configuration.resolve.calledOnce ).to.be.true;
            expect( configuration.resolve.withArgs( event /* note: event object updated */ ).calledOnce ).to.be.true;
        });

        it( 'fail: iat in the future', function() {

            const xsrfToken = uuid.v4();

            const token = jwtBuilder( { algorithm: 'HS256', secret: 'super-secret', user: 'fred', xsrf: xsrfToken, iat: 100 } );

            const config = {

                algorithm: 'HS256',
                key: 'super-secret',
                tokenName: 'jwt',
                xsrfTokenName: 'xsrfToken',
                xsrfClaimName: 'xsrf',
                xsrf: true };

            let event = { jwt: token, xsrfToken };

            configuration.resolve.returns( config );

            expect( validator.validate.bind( validator, event, configuration ) ).to.throw( 'authentication error: token used before issue date' );

            expect( event.jwt ).to.equal( token );

            expect( configuration.isEnabled.calledOnce ).to.be.true;
            expect( configuration.isEnabled.withArgs().calledOnce ).to.be.true;

            expect( configuration.resolve.calledOnce ).to.be.true;
            expect( configuration.resolve.withArgs( event /* note: event object updated */ ).calledOnce ).to.be.true;
        });

        it( 'fail: expired token', function() {

            const xsrfToken = uuid.v4();

            const token = jwtBuilder( { algorithm: 'HS256', secret: 'super-secret', user: 'fred', xsrf: xsrfToken, exp: -100 } );

            const config = {

                algorithm: 'HS256',
                key: 'super-secret',
                tokenName: 'jwt',
                xsrfTokenName: 'xsrfToken',
                xsrfClaimName: 'xsrf',
                xsrf: true };

            let event = { jwt: token, xsrfToken };

            configuration.resolve.returns( config );

            expect( validator.validate.bind( validator, event, configuration ) ).to.throw( 'authentication error: Token expired' );

            expect( event.jwt ).to.equal( token );

            expect( configuration.isEnabled.calledOnce ).to.be.true;
            expect( configuration.isEnabled.withArgs().calledOnce ).to.be.true;

            expect( configuration.resolve.calledOnce ).to.be.true;
            expect( configuration.resolve.withArgs( event /* note: event object updated */ ).calledOnce ).to.be.true;
        });

        it( 'fail: missing xsrf token', function() {

            const xsrfToken = uuid.v4();

            const token = jwtBuilder( { algorithm: 'HS256', secret: 'super-secret', user: 'fred', xsrf: xsrfToken } );

            const config = {

                algorithm: 'HS256',
                key: 'super-secret',
                tokenName: 'jwt',
                xsrfTokenName: 'xsrfToken',
                xsrfClaimName: 'xsrf',
                xsrf: true };

            let event = { jwt: token, /*xsrfToken*/ };

            configuration.resolve.returns( config );

            expect( validator.validate.bind( validator, event, configuration ) ).to.throw( 'authentication error: missing xsrf token' );

            expect( event.jwt ).to.equal( token );

            expect( configuration.isEnabled.calledOnce ).to.be.true;
            expect( configuration.isEnabled.withArgs().calledOnce ).to.be.true;

            expect( configuration.resolve.calledOnce ).to.be.true;
            expect( configuration.resolve.withArgs( event /* note: event object updated */ ).calledOnce ).to.be.true;
        });

        it( 'fail: missing xsrf claim', function() {

            const xsrfToken = uuid.v4();

            const token = jwtBuilder( { algorithm: 'HS256', secret: 'super-secret', user: 'fred' } );

            const config = {

                algorithm: 'HS256',
                key: 'super-secret',
                tokenName: 'jwt',
                xsrfTokenName: 'xsrfToken',
                xsrfClaimName: 'xsrf',
                xsrf: true };

            let event = { jwt: token, xsrfToken };

            configuration.resolve.returns( config );

            expect( validator.validate.bind( validator, event, configuration ) ).to.throw( 'authentication error: xsrf claim missing' );

            expect( event.jwt ).to.equal( token );

            expect( configuration.isEnabled.calledOnce ).to.be.true;
            expect( configuration.isEnabled.withArgs().calledOnce ).to.be.true;

            expect( configuration.resolve.calledOnce ).to.be.true;
            expect( configuration.resolve.withArgs( event /* note: event object updated */ ).calledOnce ).to.be.true;
        });

        it( 'fail: xsrf mismatch', function() {

            const xsrfToken = uuid.v4();

            const token = jwtBuilder( { algorithm: 'HS256', secret: 'super-secret', user: 'fred', xsrf: xsrfToken } );

            const config = {

                algorithm: 'HS256',
                key: 'super-secret',
                tokenName: 'jwt',
                xsrfTokenName: 'xsrfToken',
                xsrfClaimName: 'xsrf',
                xsrf: true };

            let event = { jwt: token, xsrfToken: uuid.v4() };

            configuration.resolve.returns( config );

            expect( validator.validate.bind( validator, event, configuration ) ).to.throw( 'authentication error: xsrf token mismatch' );

            expect( event.jwt ).to.equal( token );

            expect( configuration.isEnabled.calledOnce ).to.be.true;
            expect( configuration.isEnabled.withArgs().calledOnce ).to.be.true;

            expect( configuration.resolve.calledOnce ).to.be.true;
            expect( configuration.resolve.withArgs( event /* note: event object updated */ ).calledOnce ).to.be.true;
        });
    });
});
