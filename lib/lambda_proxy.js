'use strict';

const utils = require( './utils' );

class LambdaProxy {

    constructor() {

        this._headers = {};
    }

    header( name, value ) {

        this._headers[ name ] = value;

        return this;
    }

    onError( event, context, error ) {

        let proxyObject = {};

        proxyObject.statusCode = error.status || error.statusCode || 500;
        proxyObject.headers = utils.clone( this._headers );

        let body = {

            type: error.name,
            message: error.message
        };

        proxyObject.body = JSON.stringify( body );

        return proxyObject;
    }

    onResult( event, context, result ) {

        let proxyObject = {};

        result = result || {};

        proxyObject.statusCode = result.statusCode || this.getStatusCode( event.httpMethod, result );
        proxyObject.headers = result.headers || utils.clone( this._headers );

        let body = result.body || result;

        if( !utils.isString( body ) ) {

            body = JSON.stringify( body );
        }

        proxyObject.body = body;

        return proxyObject;
    }

    getStatusCode( httpMethod /*, result*/ ) {

        switch( httpMethod ) {

            case 'DELETE':
                return 204;

            case 'POST':
                return 201;

            default:
                return 200;
        }
    }

    static fromConfiguration( proxyConfig ) {

        let lambdaProxy;

        if( proxyConfig === true ) {

            lambdaProxy = new LambdaProxy();
        }
        else if( utils.isObject( proxyConfig ) ) {

            if( (proxyConfig instanceof LambdaProxy) || (utils.isFunction( proxyConfig.onError ) && utils.isFunction( proxyConfig.onResult ) ) ) {

                lambdaProxy = proxyConfig;
            }
            else {

                // {
                //     headers: {
                //
                //         myheader: "value",
                //         ...
                //     }
                // }

                lambdaProxy = new LambdaProxy();

                // init from configuration object
                if( proxyConfig.headers ) {

                    for( let key in proxyConfig.headers ) {

                        lambdaProxy.header( key, proxyConfig.headers[ key ].toString() );
                    }
                }
            }
        }

        return lambdaProxy;
    }
}

module.exports = LambdaProxy;
