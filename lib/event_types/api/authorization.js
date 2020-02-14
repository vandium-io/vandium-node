/**
 * Authotization config
 */

 const { client, Provider } = require( 'jwks-source' );

let currentConfig = {};

function getJWKSConfigFromEnv() {

  if( process.env.VANDIUM_AUTH_JWKS_HOSTNAME ) {

    const path = process.env.VANDIUM_AUTH_JWKS_PATH;

    return {

      hostname: process.env.VANDIUM_AUTH_JWKS_HOSTNAME,
      path
    };
  }
  else if( process.env.VANDIUM_AUTH_JWKS_AUTH0_DOMAIN ) {

    return {

      provider: 'auth0',
      domain: process.env.VANDIUM_AUTH_JWKS_AUTH0_DOMAIN,
    };
  }
  else if( process.env.VANDIUM_AUTH_JWKS_COGNITO_USER_POOL_ID ) {

    const region = process.env.VANDIUM_AUTH_JWKS_COGNITO_REGION;

    return {

      provider: 'awscognito',
      userPoolId: process.env.VANDIUM_AUTH_JWKS_COGNITO_USER_POOL_ID,
      region: region, // can be undefined
    };
  }
}

function setValueIfExists( obj, name, value ) {

  if( value ) {

    obj[ name ] = value;
  }
}

function getJWTConfigFromEnv() {

  const jwt = { };

  [

    [ 'algorithm', process.env.VANDIUM_JWT_ALGORITHM ],
    [ 'publicKey', process.env.VANDIUM_JWT_PUBKEY ],
    [ 'key', process.env.VANDIUM_JWT_KEY ],
    [ 'secret', process.env.VANDIUM_JWT_SECRET ],
    [ 'xsrf', process.env.VANDIUM_JWT_USE_XSRF ],
    [ 'xsrfToken', process.env.VANDIUM_JWT_XSRF_TOKEN_PATH ],
    [ 'xsrfClaim', process.env.VANDIUM_JWT_XSRF_CLAIM_PATH ],
    [ 'token', process.env.VANDIUM_JWT_TOKEN_PATH ],

  ].forEach( ([name, value]) => setValueIfExists( jwt, name, value ) );

  return jwt;
}

//: path || '/.well-known/jwks.json',
function useJwks( options ) {

  if( currentConfig.jwk ) {

    throw new Error( 'JWK already configured' );
  }

  if( !options ) {

    options = getConfig().jwks;

    if( !options ) {

      throw new Error( 'Missing configuration options for useJwks()' );
    }
  }

  const { provider, ...details } = options;

  let jwksClient;

  switch( provider ) {

    case 'auth0':
      jwksClient = Provider.Auth0( { ...details } );
      break;

    case 'awscognito':
      jwksClient = Provider.AWSCognito( { ...details } );
      break;

    default:
      jwksClient = client( {
          path: '/.well-known/jwks.json',
          ...details
      });
  }

  const jwks = jwksClient.getSync();

  currentConfig.jwk = jwks.keys[0];  // use first key
}

function getConfig() {

  if( currentConfig.jwks === undefined ) {

    currentConfig.jwks = getJWKSConfigFromEnv() || null;
  }

  if( currentConfig.jwt === undefined ) {

    currentConfig.jwt = getJWTConfigFromEnv() || null;
  }

  return currentConfig;
}

function reset() {

  currentConfig = {};
}

module.exports = {

  getConfig,

  reset,

  useJwks,
};
