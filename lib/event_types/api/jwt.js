'use strict';

const utils = require( '../../utils' );

const jwt = require( '../../jwt' );

const resolveAlgorithm = jwt.resolveAlgorithm;

const DEFAULT_JWT_TOKEN_PATH = 'headers.jwt';

const DEFAULT_XSRF_TOKEN_PATH = 'headers.xsrf';

const DEFAULT_XSRF_CLAIM_PATH = 'nonce';

function optionValue( options, name, ...otherValues ) {

    return utils.applyValues( options[ name ], ...otherValues );
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

        let algorithm = options.algorithm || process.env.VANDIUM_JWT_ALGORITHM;

        if( (options.enabled === false) || !algorithm ) {

            this.enabled = false;
            return;
        }

        this.algorithm = resolveAlgorithm( algorithm );

        if( this.algorithm === 'RS256' ) {

            let key = requiredOption( options, 'publicKey', options.key,
                                       process.env.VANDIUM_JWT_PUBKEY, process.env.VANDIUM_JWT_KEY );

            this.key = jwt.formatPublicKey( key );
        }
        else {

            this.key = requiredOption( options, 'secret', options.key,
                                       process.env.VANDIUM_JWT_SECRET, process.env.VANDIUM_JWT_KEY );
        }

        this.xsrf = utils.parseBoolean( optionValue( options, 'xsrf', process.env.VANDIUM_JWT_USE_XSRF, false ) );

        if( this.xsrf ) {

            this.xsrfTokenPath = optionValue( options, 'xsrfToken', process.env.VANDIUM_JWT_XSRF_TOKEN_PATH,
                                              DEFAULT_XSRF_TOKEN_PATH ).split( '.' );
            this.xsrfClaimPath = optionValue( options, 'xsrfClaim',
                                              process.env.VANDIUM_JWT_XSRF_CLAIM_PATH, DEFAULT_XSRF_CLAIM_PATH ).split( '.' );
        }

        this.tokenPath = optionValue( options, 'token', process.env.VANDIUM_JWT_TOKEN_PATH, DEFAULT_JWT_TOKEN_PATH ).split( '.' );

        this.enabled = true;
    }

    validate( event ) {

        if( !this.enabled ) {

            // nothing to validate
            return;
        }

        let token = utils.valueFromPath( event, this.tokenPath );

        // Authorization Bearer
        if( token && token.startsWith( 'Bearer' ) ) {

            token = token.replace( 'Bearer', '' ).trim();
        }

        let decoded = jwt.decode( token, this.algorithm, this.key );

        if( this.xsrf ) {

            let xsrfToken = utils.valueFromPath( event, this.xsrfTokenPath );

            jwt.validateXSRF( decoded, xsrfToken, this.xsrfClaimPath );
        }

        event.jwt = decoded;
    }
}

module.exports = JWTValidator;
