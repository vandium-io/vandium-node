'use strict';

if( process.env.VANDIUM_PARAM_STORE_PATH ) {

    let awsParamEnv = require( 'aws-param-env' );

    // query and load environment variables
    awsParamEnv.initializer( process.env.VANDIUM_PARAM_STORE_PATH ).execute();
}
