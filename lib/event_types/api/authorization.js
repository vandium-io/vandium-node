/**
 * Authotization config
 */

const { client, Provider } = require( 'jwks-source' );

let currentConfig = {};

function parseJWKEnvString( str ) {

  let providerIndex = str.indexOf( ':' );

  const parsed = {

    provider: 'generic',
  }

  if( providerIndex > -1 ) {

    parsed.provider = str.substring( 0, providerIndex ).trim();
    str = str.substring( providerIndex + 1 ).trim();
  }

  str.split( ',' ).forEach( (pair) => {

    let index = pair.indexOf( '=' );

    parsed[ pair.substring( 0, index ).trim() ] = pair.substring( index + 1 ).trim();
  });

  return parsed;
}

function requiredValue( config, name ) {

  const value = config[ name ];

  if( !value || value.length === 0 ) {

    throw new Error( `Missing [${name}] in VANDIUM_AUTH_JWKS env variable` );
  }

  return value;
}

function getJWKSConfigFromEnv() {

  if( process.env.VANDIUM_AUTH_JWKS ) {

    const config = parseJWKEnvString( process.env.VANDIUM_AUTH_JWKS );

    const { provider } = config;

    try {

      switch( provider ) {

        case 'auth0':
          return {

            provider,
            domain: requiredValue( config, 'domain' ),
          };

        case 'awscognito':
          return {

            provider,
            userPoolId: requiredValue( config, 'userPoolId' ),
            region: config.region,
          }

        case 'generic':
          return {

            hostname: requiredValue( config, 'hostname' ),
            path: config.path || '/.well-known/jwks.json',
          }

        default:
          throw new Error( `Unsupported provider: [${provider}] in VANDIUM_AUTH_JWKS env variable` );
      }
    }
    catch( err ) {

      // for missing values
      console.error( err.message );
    }
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
      jwksClient = client( { ...details });
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
