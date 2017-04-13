'use strict';

const JWTConfiguration = require( './base_configuration' );

class JWTPluginConfiguration extends JWTConfiguration {

    constructor() {

        super();
    }

    update( options ) {

        options = options || {};

        super.update( options );

        if( options.lambdaProxy ) {

            this.lambdaProxy = options.lambdaProxy;
        }
    }

    resolve( event ) {

        let values = super.resolve( event );

        if( this.lambdaProxy ) {

            let headers = event.headers || {};

            values.token = headers[ values.tokenName ];
        }
        else {

            values.token = event[ values.tokenName ];
        }

        return values;
    }
}

module.exports = JWTPluginConfiguration;
