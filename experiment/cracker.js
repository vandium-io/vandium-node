'use strict';

const vandium = require( 'vandium' );



exports.handler = vandium.s3( ( records ) => {


});


exports.handler = vandium.ses( ( records ) => {

});

exports.handler = vandium.cloudformation( ( event ) => {


});

exports.handler = vandium.cloudwatch( ( logs ) => {


});

exports.handler = vandium.sns( ( records ) => {


});

exports.handler = vandium.dynamodb( ( records ) => {


});

exports.handler = vandium.cognito( (event) => {


});

exports.handler = vandium.kinesis( (records) => {


});

exports.handler = vandium.lex( (event) => {


                    });


exports.handler = vandium.api( /* config here too */ )
                    .JWT( {

                        // config here
                    })
                    .protection( {

                        sql: true,  // or false

                        body: true,
                        queryStringParameters: true,
                        headers: true,
                        // etc
                    })
                    .GET( {

                            query: {

                                expand: vandium.types.boolean()
                            }
                        },
                        ( event ) => {

                            return 'ok';
                        }
                    )
                    .POST( {

                            body: {


                            }
                        },
                        ( event, callback ) => {

                            //this.context;

                            callback( new Error( 'Bang!' ) );
                        }
                    )
                    .PUT( {

                            body: {


                            }
                        },
                        ( event ) => {

                    })
                    .DELETE(
                        (event) => {


                        }
                    )
                    .onError( (err) => {

                        // transforn error
                    })
                    .finally( () => {

                        // clean up here
                        //return dao.release();
                    });
