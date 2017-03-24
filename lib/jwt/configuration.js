'use strict';

const AuthenticationFailureError = require( '../errors' ).AuthenticationFailureError;

const utils = require( '../utils' );

const DEFAULT_TOKEN_NAME = 'jwt';

const DEFAULT_XSRF_TOKEN_NAME = 'xsrfToken';

const DEFAULT_XSRF_CLAIM_NAME = 'xsrfToken';

function resolveValue( /* multiple args */ ) {

    let resolved;

    for( let arg of arguments ) {

        if( arg ) {

            resolved = arg;
            break;
        }
    }

    return resolved;
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

    updateFromEnvVars() {

        let options = {};

        options.algorithm = process.env.VANDIUM_JWT_ALGORITHM;
        options.secret = process.env.VANDIUM_JWT_SECRET;
        options.public_key = process.env.VANDIUM_JWT_PUBKEY;
        options.token_name = process.env.VANDIUM_JWT_TOKEN_NAME;

        if( process.env.VANDIUM_JWT_USE_XSRF ) {

            options.xsrf = utils.parseBoolean( process.env.VANDIUM_JWT_USE_XSRF );
        }

        options.xsrf_token_name = process.env.VANDIUM_JWT_XSRF_TOKEN_NAME;
        options.xsrf_claim_name = process.env.VANDIUM_JWT_XSRF_CLAIM_NAME;

        // remove unwanted keys
        for( let key in options ) {

            if( options[ key ] === undefined ) {

                delete options[ key ];
            }
        }

        this.update( options );
    }

    update( options ) {

        options = options || {};

        this.enabled = (options.enable === true);

        if( options.algorithm ) {

            let algorithm = options.algorithm;

            switch( algorithm ) {

                case 'HS256':
                case 'HS384':
                case 'HS512':
                    this.enabled = true;
                    this.algorithm = algorithm;
                    this.key = options.secret;
                    break;

                case 'RS256':
                    this.enabled = true;
                    this.algorithm = algorithm;
                    this.key = options.public_key;
                    break;
            }
        }

        if( options.token_name ) {

            this.enabled = true;
            this.tokenName = options.token_name;
        }

        if( options.xsrf !== undefined ) {

            this.enabled = true;
            this.useXsrf = (options.xsrf === true);
        }

        if( options.xsrf_token_name ) {

            this.enabled = true;
            this.xsrfTokenName = options.xsrf_token_name;
        }

        if( options.xsrf_claim_name ) {

            this.enabled = true;
            this.xsrfClaimName = options.xsrf_claim_name;
        }
    }

    get() {

        let config = {enable: this.enabled };

        if( this.enabled !== true ) {

            return config;
        }

        if( this.algorithm ) {

            config.algorithm = this.algorithm;

            if( this.algorithm === 'RS256' ) {

                config.public_key = this.key;
            }
            else {

                config.secret = this.key;
            }
        }

        if( this.tokenName ) {

            config.token_name = this.tokenName;
        }

        if( this.useXsrf ) {

            if( this.xsrfTokenName ) {

                config.xsrf_token_name = this.xsrfTokenName;
            }

            if( this.xsrfClaimName ) {

                config.xsrf_claim_name = this.xsrfClaimName;
            }
        }

        return config;
    }

    isEnabled() {

        return !!this.enabled;
    }

    resolve( event ) {

        const stageVariables = this._resolveStageVariables( event );

        let values = {

            algorithm: this.algorithm,
            key: this.key,
            tokenName: this._getTokenName( stageVariables ),
            xsrf: this.useXsrf,
        };

        if( !values.algorithm ) {

            values.algorithm = resolveAlgorithm( stageVariables.VANDIUM_JWT_ALGORITHM );
        }

        if( !values.key ) {

            let key = (values.algorithm === 'RS256' ) ? stageVariables.VANDIUM_JWT_PUBKEY : stageVariables.VANDIUM_JWT_SECRET;

            if( !key ) {

                throw new AuthenticationFailureError( 'missing validation key' );
            }

            values.key = key;
        }

        if( values.xsrf || stageVariables.VANDIUM_JWT_XSRF_TOKEN_NAME || stageVariables.VANDIUM_JWT_XSRF_CLAIM_NAME ) {

            values.xsrf = true;

            values.xsrfTokenName = this._getXsrfTokenName( stageVariables );
            values.xsrfClaimName = this._getXsrfClaimName( stageVariables );
        }

        values.token = event[ values.tokenName ];

        return values;
    }

    getIgnoredProperties( event ) {

        let stageVariables = this._resolveStageVariables( event );

        let ignored = [];

        if( this.enabled ) {

            ignored.push( this._getTokenName( stageVariables ) );

            if( this.useXsrf ) {

                ignored.push( this._getXsrfTokenName( stageVariables ) );
            }
        }

        return ignored;
    }

    get state() {

        let state = { enabled: this.enabled };

        if( state.enabled === true ) {

            if( this.key ) {

                state.key = this.key;
            }

            if( this.algorithm ) {

                state.algorithm = this.algorithm;
            }

            state.tokenName = this._getTokenName( {} );
            state.xsrf = this.useXsrf;

            if( state.xsrf ) {

                state.xsrfToken = this._getXsrfTokenName( {} );
                state.xsrfClaimName = this._getXsrfClaimName( {} );
            }
        }


        return state;
    }

    _getTokenName( stageVariables ) {

        return resolveValue( this.tokenName, stageVariables.VANDIUM_JWT_TOKEN_NAME, DEFAULT_TOKEN_NAME );
    }


    _getXsrfTokenName( event ) {

        return resolveValue( this.xsrfTokenName, event.VANDIUM_JWT_XSRF_TOKEN_NAME, DEFAULT_XSRF_TOKEN_NAME );
    }

    _getXsrfClaimName( event ) {

        return resolveValue( this.xsrfClaimName, event.VANDIUM_JWT_XSRF_CLAIM_NAME, DEFAULT_XSRF_CLAIM_NAME );
    }

    _resolveStageVariables( event ) {

        let stageVariables = event || {};

        return stageVariables;
    }
}

module.exports = JWTConfiguration;
