const { applyValues, parseBoolean, valueFromPath } = require( '../../utils' );

const { decode, formatPublicKey, resolveAlgorithm, validateXSRF } = require( '../../jwt' );

const jwkToPem = require('jwk-to-pem');

const { getConfig: getAuthConfig  } = require( '../../auth' );

const DEFAULT_JWT_TOKEN_PATH = 'headers.Authorization';

const DEFAULT_XSRF_TOKEN_PATH = 'headers.xsrf';

const DEFAULT_XSRF_CLAIM_PATH = 'nonce';

function optionValue( options, name, ...otherValues ) {

  return applyValues( options[ name ], ...otherValues );
}

function requiredOption( options, name, ...otherValues ) {

  let value = optionValue( options, name, ...otherValues );

  if( !value ) {

    throw new Error( `missing required jwt configuration value: ${name}` );
  }

  return value;
}

class JWTValidator {

  constructor( options = {} ) {

    if( options === false || options === true ) {

      options = { enabled: options };
    }
    else {

      const { jwt } = getAuthConfig();

      options = {

        ...(jwt || {}),
        ...options,
      }
    }

    const { jwk } = options;

    if( jwk ) {

      const { alg, use } = jwk;

      if( alg !== 'RS256' ) {

        throw new Error( 'Unsupported algorithm in JKS: ' + alg );
      }

      if( use !== 'sig' ) {

        throw new Error( 'Key is not set to signature use' );
      }

      this.algorithm = alg;
      this.key = jwkToPem( jwk );
    }
    else {

      const algorithm = options.algorithm;

      if( options.enabled === false ) {

        this.enabled = false;
        return;
      }

      this.algorithm = resolveAlgorithm( algorithm );

      if( this.algorithm === 'RS256' ) {

        const key = requiredOption( options, 'publicKey', options.key );

        this.key = formatPublicKey( key );
      }
      else {

        this.key = requiredOption( options, 'secret', options.key );
      }
    }

    this.xsrf = parseBoolean( optionValue( options, 'xsrf', false ) );

    if( this.xsrf ) {

      this.xsrfTokenPath = optionValue( options, 'xsrfToken', DEFAULT_XSRF_TOKEN_PATH ).split( '.' );
      this.xsrfClaimPath = optionValue( options, 'xsrfClaim', DEFAULT_XSRF_CLAIM_PATH ).split( '.' );
    }

    this.tokenPath = optionValue( options, 'token', DEFAULT_JWT_TOKEN_PATH ).split( '.' );

    this.enabled = true;
  }

  validate( event ) {

    if( !this.enabled ) {

      // nothing to validate
      return;
    }

    let token = valueFromPath( event, this.tokenPath );

    // Authorization Bearer
    if( token && token.startsWith( 'Bearer' ) ) {

      token = token.replace( 'Bearer', '' ).trim();
    }

    let decoded = decode( token, this.algorithm, this.key );

    if( this.xsrf ) {

      let xsrfToken = valueFromPath( event, this.xsrfTokenPath );

      validateXSRF( decoded, xsrfToken, this.xsrfClaimPath );
    }

    event.jwt = decoded;
  }
}

module.exports = JWTValidator;
