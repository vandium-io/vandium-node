'use strict';

const AuthenticationFailureError = require( '../../errors' ).AuthenticationFailureError;

const DEFAULT_TOKEN_NAME = 'jwt';

const DEFAULT_XSRF_TOKEN_NAME = 'xsrfToken';

const DEFAULT_XSRF_CLAIM_NAME = 'xsrfToken';

function resolveValue( configValue, eventValue, defaultValue ) {

    if( configValue ) {

        return configValue;
    }
    else if( eventValue ) {

        return eventValue;
    }
    else {

        return defaultValue;
    }
}

function resolveAlgorithm( algorithm ) {

    if( !algorithm ) {

        throw new AuthenticationFailureError( 'missing algorithm' );
    }

    switch( algorithm ) {

        case 'HS256':
        case 'HS384':
        case 'HS512':
        case 'RS256':
            break;

        default:
            throw new AuthenticationFailureError( 'unsupported jwt algorithm: ' + algorithm );
    }

    return algorithm;
}

class JWTConfiguration {

    constructor() {

        this.enabled = false;
        this.useXsrf = false;
    }

    update( options ) {

        if( !options ) {

            return;
        }

        this.enabled = true;

        if( options.algorithm ) {

            let algorithm = options.algorithm;

            switch( algorithm ) {

                case 'HS256':
                case 'HS384':
                case 'HS512':
                    this.algorithm = algorithm;
                    this.key = options.secret;
                    break;

                case 'RS256':
                    this.algorithm = algorithm;
                    this.key = options.public_key;
                    break;
            }
        }

        if( options.token_name ) {

            this.tokenName = options.token_name;
        }

        if( options.xsrf ) {

            this.useXsrf = (options.xsrf === true);
        }

        if( options.xsrf_token_name ) {

            this.xsrfTokenName = options.xsrf_token_name;
        }

        if( options.xsrf_claim_name ) {

            this.xsrfClaimName = options.xsrf_claim_name;
        }
    }

    isEnabled() {

        return !!this.enabled;
    }

    resolve( event ) {

        let values = {

            algorithm: this.algorithm,
            key: this.key,
            tokenName: this._getTokenName( event ),
            xsrf: this.useXsrf,
        };

        if( !values.algorithm ) {

            values.algorithm = resolveAlgorithm( event.VANDIUM_JWT_ALGORITHM );
        }

        if( !values.key ) {

            let key = (values.algorithm === 'RS256' ) ? event.VANDIUM_JWT_PUBKEY : event.VANDIUM_JWT_SECRET;

            if( !key ) {

                throw new AuthenticationFailureError( 'missing validation key' );
            }

            values.key = key;
        }

        if( values.xsrf || event.VANDIUM_JWT_XSRF_TOKEN_NAME || event.VANDIUM_JWT_XSRF_CLAIM_NAME ) {

            values.xsrf = true;

            values.xsrfTokenName = this._getXsrfTokenName( event );
            values.xsrfClaimName = this._getXsrfClaimName( event );
        }

        return values;
    }

    getIgnoredProperties( event ) {

        let ignored = [];

        if( this.enabled ) {

            ignored.push( this._getTokenName( event ) );

            if( this.useXsrf ) {

                ignored.push( this._getXsrfTokenName( event ) );
            }
        }

        return ignored;
    }

    state() {

        return {

            enabled: this.enabled,
            key: this.key,
            algorithm: this.algorithm,
            tokenName: this._getTokenName( {} )
        };
    }

    _getTokenName( event ) {

        return resolveValue( this.tokenName, event.VANDIUM_JWT_TOKEN_NAME, DEFAULT_TOKEN_NAME );
    }


    _getXsrfTokenName( event ) {

        return resolveValue( this.xsrfTokenName, event.VANDIUM_JWT_XSRF_TOKEN_NAME, DEFAULT_XSRF_TOKEN_NAME );
    }

    _getXsrfClaimName( event ) {

        return resolveValue( this.xsrfClaimName, event.VANDIUM_JWT_XSRF_CLAIM_NAME, DEFAULT_XSRF_CLAIM_NAME );
    }
}

module.exports = JWTConfiguration;
