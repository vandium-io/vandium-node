const { expect } = require( 'chai' );

const proxyquire = require( 'proxyquire' );

const sinon = require( 'sinon' );

const envRestorer = require( 'env-restorer' );



describe( 'lib/event_types/api/authorization', function() {

  let authorization;

  let jwksSourceStub;

  beforeEach( function() {

      // restore all env vars to defaults
      envRestorer.restore();

      jwksSourceStub = {

        Provider: {},

        client: sinon.stub(),
      };

      authorization = proxyquire( '../authorization', {

          'jwks-source': jwksSourceStub
      });
  });

  describe( '.getConfig', function() {

    it( 'normal operation without any environment variables defined', function() {

      const config = authorization.getConfig();

      expect( config ).to.eql( { jwks: null, jwt: {} } );
    });

    it( 'normal operation, all JWT env values', function() {

      process.env.VANDIUM_JWT_ALGORITHM = 'AlgorithmHere!';
      process.env.VANDIUM_JWT_PUBKEY = 'PubKeyHere!';
      process.env.VANDIUM_JWT_KEY = 'KeyHere!';
      process.env.VANDIUM_JWT_SECRET = 'SecretHere!';
      process.env.VANDIUM_JWT_USE_XSRF = 'UseXSRF!';
      process.env.VANDIUM_JWT_XSRF_TOKEN_PATH = 'XSRFTokenPath!';
      process.env.VANDIUM_JWT_XSRF_CLAIM_PATH = 'XSRFClaimPath!';
      process.env.VANDIUM_JWT_TOKEN_PATH = 'TokenPath!';

      const { jwt } = authorization.getConfig();

      expect( jwt ).to.eql( {

          algorithm: "AlgorithmHere!",
          key: "KeyHere!",
          publicKey: "PubKeyHere!",
          secret: "SecretHere!",
          token: "TokenPath!",
          xsrf: "UseXSRF!",
          xsrfClaim: "XSRFClaimPath!",
          xsrfToken: "XSRFTokenPath!",
        });
    });

    it( 'normal operation, VANDIUM_AUTH_JWKS, hostname only' , function() {

      process.env.VANDIUM_AUTH_JWKS = 'hostname=auth.vandium.io';

      const { jwks } = authorization.getConfig();

      expect( jwks ).to.eql( {

          hostname: "auth.vandium.io",
          path: '/.well-known/jwks.json',
        });
    });

    it( 'normal operation, VANDIUM_AUTH_JWKS, hostname and path' , function() {

      process.env.VANDIUM_AUTH_JWKS = 'hostname=auth.vandium.io,path=/jwks/jwks.json';

      const { jwks } = authorization.getConfig();

      expect( jwks ).to.eql( {

          hostname: "auth.vandium.io",
          path: '/jwks/jwks.json',
        });
    });

    it( 'normal operation, VANDIUM_AUTH_JWKS, provider: auth0' , function() {

      process.env.VANDIUM_AUTH_JWKS = 'auth0:domain=auth.vandium.io';

      const { jwks } = authorization.getConfig();

      expect( jwks ).to.eql( {

          provider: 'auth0',
          domain: "auth.vandium.io",
        });
    });

    it( 'normal operation, VANDIUM_AUTH_JWKS, provider: awscognito' , function() {

      process.env.VANDIUM_AUTH_JWKS = 'awscognito:userPoolId=us-east-1_ZEFASSAA,region=us-east_1';

      const { jwks } = authorization.getConfig();

      expect( jwks ).to.eql( {

          provider: 'awscognito',
          userPoolId: 'us-east-1_ZEFASSAA',
          region: 'us-east_1',
        });
    });

    it( 'normal operation, VANDIUM_AUTH_JWKS, provider: awscognito, no region' , function() {

      process.env.VANDIUM_AUTH_JWKS = 'awscognito:userPoolId=us-east-1_ZEFASSAA';

      const { jwks } = authorization.getConfig();

      expect( jwks ).to.eql( {

          provider: 'awscognito',
          userPoolId: 'us-east-1_ZEFASSAA',
          region: undefined
        });
    });

    it( 'fail for bad provider' , function() {

      process.env.VANDIUM_AUTH_JWKS = 'whatever:domain=auth.vandium.io';

      const { jwks } = authorization.getConfig();

      expect( jwks ).to.eql( null );
    });

    it( 'fail when domain missing for auth0', function() {

      process.env.VANDIUM_AUTH_JWKS = 'auth0:whatever=auth.vandium.io';

      const { jwks } = authorization.getConfig();

      expect( jwks ).to.eql( null );
    });

    it( 'fail when userPoolId is missing missing for awscognito', function() {

      process.env.VANDIUM_AUTH_JWKS = 'awscognito:whatever=auth.vandium.io';

      const { jwks } = authorization.getConfig();

      expect( jwks ).to.eql( null );
    });

    it( 'fail when hostname is missing missing for generic provider', function() {

      process.env.VANDIUM_AUTH_JWKS = 'whatever=auth.vandium.io';

      const { jwks } = authorization.getConfig();

      expect( jwks ).to.eql( null );
    });

    it( 'fail string is missing', function() {

      process.env.VANDIUM_AUTH_JWKS = ' ';

      const { jwks } = authorization.getConfig();

      expect( jwks ).to.eql( null );
    });
  });

  describe( '.useJwks', function() {

    it( 'using VANDIUM_AUTH_JWKS, generic without path', function() {

      process.env.VANDIUM_AUTH_JWKS = 'hostname=auth.vandium.io';

      const clientStub = {

        getSync: sinon.stub().returns( { keys: [ { id: 'key1' } ] } ),
      };

      jwksSourceStub.client.returns( clientStub );

      authorization.useJwks();

      expect( jwksSourceStub.client.firstCall.args ).to.eql( [{

          hostname: 'auth.vandium.io',
          path: '/.well-known/jwks.json',
        }]);

      expect( authorization.getConfig().jwk ).to.eql( { id: 'key1' } );
    });

    it( 'using VANDIUM_AUTH_JWKS, generic with path', function() {

      process.env.VANDIUM_AUTH_JWKS = 'hostname=auth.vandium.io, path=whatever';

      const clientStub = {

        getSync: sinon.stub().returns( { keys: [ { id: 'key1' } ] } ),
      };

      jwksSourceStub.client.returns( clientStub );

      authorization.useJwks();

      expect( jwksSourceStub.client.firstCall.args ).to.eql( [{

          hostname: 'auth.vandium.io',
          path: 'whatever',
        }]);

      expect( authorization.getConfig().jwk ).to.eql( { id: 'key1' } );
    });

    it( 'using VANDIUM_AUTH_JWKS, auth0', function() {

      process.env.VANDIUM_AUTH_JWKS = 'auth0:domain=auth.vandium.io';

      const clientStub = {

        getSync: sinon.stub().returns( { keys: [ { id: 'key1' } ] } ),
      };

      jwksSourceStub.Provider.Auth0 = sinon.stub().returns( clientStub );

      authorization.useJwks();

      expect( jwksSourceStub.Provider.Auth0.firstCall.args ).to.eql( [{

          domain: 'auth.vandium.io',
        }]);

      expect( authorization.getConfig().jwk ).to.eql( { id: 'key1' } );
    });

    it( 'using VANDIUM_AUTH_JWKS, awscognito', function() {

      process.env.VANDIUM_AUTH_JWKS = 'awscognito:userPoolId=us-east-1_ZEFASSAA,region=us-east_1';

      const clientStub = {

        getSync: sinon.stub().returns( { keys: [ { id: 'key1' } ] } ),
      };

      jwksSourceStub.Provider.AWSCognito = sinon.stub().returns( clientStub );

      authorization.useJwks();

      expect( jwksSourceStub.Provider.AWSCognito.firstCall.args ).to.eql( [{

          userPoolId: 'us-east-1_ZEFASSAA',
          region: 'us-east_1',
        }]);

      expect( authorization.getConfig().jwk ).to.eql( { id: 'key1' } );
    });

    it( 'with configuration', function() {

      const clientStub = {

        getSync: sinon.stub().returns( { keys: [ { id: 'key1' } ] } ),
      };

      jwksSourceStub.client.returns( clientStub );

      authorization.useJwks( {

          hostname: 'auth.vandium.io',
          path: '/.well-known/jwks.json',
        });

      expect( jwksSourceStub.client.firstCall.args ).to.eql( [{

          hostname: 'auth.vandium.io',
          path: '/.well-known/jwks.json',
        }]);

      expect( authorization.getConfig().jwk ).to.eql( { id: 'key1' } );
    });
  });

  it( 'fail without options or environment variables', function() {

    expect( authorization.useJwks.bind() ).to.throw( 'Missing configuration options for useJwks()' );
  });

  it( 'fail when called more than once', function() {

    const clientStub = {

      getSync: sinon.stub().returns( { keys: [ { id: 'key1' } ] } ),
    };

    jwksSourceStub.client.returns( clientStub );

    authorization.useJwks( {

        hostname: 'auth.vandium.io',
        path: '/.well-known/jwks.json',
      });

    expect( jwksSourceStub.client.firstCall.args ).to.eql( [{

        hostname: 'auth.vandium.io',
        path: '/.well-known/jwks.json',
      }]);

    expect( authorization.getConfig().jwk ).to.eql( { id: 'key1' } );

    // fail if called again
    expect( authorization.useJwks.bind( null, [{

        hostname: 'auth.vandium.io',
        path: '/.well-known/jwks.json',
      }]) ).to.throw( 'JWK already configured' );
  });
});
