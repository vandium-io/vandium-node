'use strict';

const utils = require( '../../utils' );

const jwt = require( '../../jwt' );

const resolveAlgorithm = jwt.resolveAlgorithm;

const DEFAULT_JWT_TOKEN_PATH = 'headers.jwt';

const DEFAULT_XSRF_TOKEN_PATH = 'headers.xsrfToken';

const DEFAULT_XSRF_CLAIM_NAME = 'xsrfToken';

function optionValue( options, name, ...otherValues ) {

    return utils.applyValues( options[ name ], ...otherValues );
}

function requiredOption( options, name, otherValues ) {

    let value = optionValue( options, name, ...otherValues );

    if( !value ) {

        throw new Error( `missing required jwt configuration value: ${name}` );
    }

    return value;
}

class JWTValidator {

    constructor( options = {} ) {

        let algorithm = options.algorithm || process.env.VANDIUM_JWT_ALGORITHM;

        if( !algorithm ) {

            this.enabled = false;
            return;
        }

        this.algorithm = resolveAlgorithm( algorithm );

        if( this.algorithm === 'RS256' ) {

            this.key = requiredOption( options, 'publicKey', options.key,
                                       process.env.VANDIUM_JWT_PUBKEY, process.env.VANDIUM_JWT_KEY );
        }
        else {

            this.key = requiredOption( options, 'secret', options.key,
                                       process.env.VANDIUM_JWT_SECRET, process.env.VANDIUM_JWT_KEY );
        }

        this.xsrf = utils.parseBoolean( optionValue( options, 'xsrf', process.env.VANDIUM_JWT_USE_XSRF, false ) );

        if( this.xsrf ) {

            this.xsrfTokenPath = optionValue( options, 'xsrfToken', process.env.VANDIUM_JWT_XSRF_TOKEN_PATH,
                                              DEFAULT_XSRF_TOKEN_PATH ).spit( '.' );
            this.xsrfClaimName = optionValue( options, 'xsrfClaimName',
                                              process.env.VANDIUM_JWT_XSRF_CLAIM_NAME, DEFAULT_XSRF_CLAIM_NAME );
        }

        this.tokenPath = optionValue( options, 'token', process.env.VANDIUM_JWT_TOKEN_PATH, DEFAULT_JWT_TOKEN_PATH );

        this.enabled = true;
    }

    validate( event ) {

        if( !this.enabled ) {

            // nothing to validate
            return;
        }

        let token = utils.valueFromPath( 'token', event, this.tokenPath );

        let decoded = jwt.decode( token, this.algorithm, this.key );

        if( this.xsrf ) {

            let xsrfToken = utils.valueFromPath( 'xsrfToken', event, this.xsrfTokenPath );

            jwt.validateXSRF( decoded, xsrfToken, this.xsrfClaimName );
        }

        event.jwt = decoded;
    }
}

module.exports = JWTValidator;
