'use strict';

const recordHandler = require( './record' );

module.exports = {

    api: require( './api' ),

    s3( handler ) {

        return recordHandler( handler );
    },

    dynamodb( handler ) {

        return recordHandler( handler );
    },

    sns( handler ) {

        return recordHandler( handler );
    },

    ses( handler ) {

        return recordHandler( handler );
    },

    kinesis( handler ) {

        return recordHandler( handler );
    }

    // 'apigateway'
    // 'cloudformation'
    // 'cloudwatch'
    // 'cognito'
    // 'lex'
    // 'scheduled'
};
