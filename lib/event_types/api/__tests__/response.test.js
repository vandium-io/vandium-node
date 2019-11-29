/*jshint expr: true*/

const { expect } = require( 'chai' );

const cookie = require( 'cookie' );

const sinon = require( 'sinon' );

const responseProcessor = require( '../response' );

const { HTTP_METHODS } = require( '../constants' );

describe( 'lib/event_types/api/response', function() {

    describe( './processResult', function() {

        const { processResult } = responseProcessor;

        function createContext( httpMethod = 'GET' ) {

            return {

                event: {

                    httpMethod
                },
            };
        }

        HTTP_METHODS.map( (httpMethod) => { switch( httpMethod ) {

                case 'DELETE':
                    return [ httpMethod, 204 ];

                case 'POST':
                    return [ httpMethod, 201 ];

                default:
                    return [ httpMethod, 200 ];
            }})
            .forEach( ( [ httpMethod, expectedStatusCode ] ) => {

                it( `body: null and httpMethod: ${httpMethod}`, function() {

                    const context = createContext( httpMethod );

                    let resultObject = processResult( null, context, null );

                    expect( resultObject ).to.eql( {

                        result: {
                            statusCode: expectedStatusCode,
                            headers: {},
                            body: null,
                            isBase64Encoded: false,
                        },
                    });
                });

                it( `body: string and httpMethod: ${httpMethod}`, function() {

                    const context = createContext( httpMethod );

                    let resultObject = processResult( 'ok', context, null );

                    expect( resultObject ).to.eql( {

                        result: {
                            statusCode: expectedStatusCode,
                            headers: {},
                            body: 'ok',
                            isBase64Encoded: false,
                        },
                    });
                });

                it( `body: response (body only) and httpMethod: ${httpMethod}`, function() {

                    const context = createContext( httpMethod );

                    let resultObject = processResult( { body: 'ok' }, context, null );

                    expect( resultObject ).to.eql( {

                        result: {
                            statusCode: expectedStatusCode,
                            headers: {},
                            body: 'ok',
                            isBase64Encoded: false,
                        },
                    });
                });
        });

        it( 'body: response (body, statusCode) and httpMethod: GET', function() {

            const context = createContext( 'GET' );

            const statusCode = 202;

            let resultObject = processResult( { body: 'ok', statusCode }, context, null );

            expect( resultObject ).to.eql( {

                result: {
                    statusCode,
                    headers: {},
                    body: 'ok',
                    isBase64Encoded: false,
                },
            });
        });

        it( 'body: response (body [object]) and httpMethod: GET', function() {

            const context = createContext( 'GET' );

            const obj = {

                one: 1,
                two: 'II',
                three: 'Three!',
            };

            let resultObject = processResult( { body: obj }, context, null );

            expect( resultObject ).to.eql( {

                result: {
                    statusCode: 200,
                    headers: {},
                    body: JSON.stringify( obj ),
                    isBase64Encoded: false,
                },
            });
        });

        it( 'body: response (body [buffer]) and httpMethod: GET', function() {

            const context = createContext( 'GET' );

            let resultObject = processResult( { body: Buffer.from( 'This is base64 encoded!') }, context, null );

            expect( resultObject ).to.eql( {

                result: {
                    statusCode: 200,
                    headers: {},
                    body: 'VGhpcyBpcyBiYXNlNjQgZW5jb2RlZCE=',
                    isBase64Encoded: true,
                },
            });
        });

        it( 'body: response (body [string, base64]) and httpMethod: GET', function() {

            const context = createContext( 'GET' );

            let resultObject = processResult( {

                    body: 'VGhpcyBpcyBiYXNlNjQgZW5jb2RlZCE=',
                    isBase64Encoded: true,
                }, context, null );

            expect( resultObject ).to.eql( {

                result: {
                    statusCode: 200,
                    headers: {},
                    body: 'VGhpcyBpcyBiYXNlNjQgZW5jb2RlZCE=',
                    isBase64Encoded: true,
                },
            });
        });

        it( 'body: response (body, statusCode, headers) and httpMethod: GET', function() {

            const context = createContext( 'GET' );

            const statusCode = 202;

            const headers = {

                h1: 'h1Value',
                h2: 'h2Value',
            };

            let resultObject = processResult( { body: 'ok', statusCode, headers }, context, null );

            expect( resultObject ).to.eql( {

                result: {
                    statusCode,
                    headers,
                    body: 'ok',
                    isBase64Encoded: false,
                },
            });
        });

        it( 'body: response (body, statusCode, headers [multiple]) and httpMethod: GET', function() {

            const context = createContext( 'GET' );

            const statusCode = 202;

            const headers = {

                h1: ['h1ValueA', 'h1ValueB' ],
                h2: 'h2Value',
            };

            let resultObject = processResult( { body: 'ok', statusCode, headers }, context, null );

            expect( resultObject ).to.eql( {

                result: {
                    statusCode,
                    headers: {

                        h2: 'h2Value',
                    },
                    multiValueHeaders: {

                        h1: ['h1ValueA', 'h1ValueB' ],
                    },
                    body: 'ok',
                    isBase64Encoded: false,
                },
            });
        });

        it( 'body: response (body, statusCode, headers [multiple]) and httpMethod: GET, additionalHeaders', function() {

            const context = createContext( 'GET' );

            const statusCode = 202;

            const headers = {

                h1: 'h1ValueA',
                h2: 'h2Value',
            };

            const additionalHeaders = {

                h1: 'h1ValueB',
                h3: 'h3Value',
            };

            let resultObject = processResult( { body: 'ok', statusCode, headers }, context, additionalHeaders );

            expect( resultObject ).to.eql( {

                result: {
                    statusCode,
                    headers: {

                        h2: 'h2Value',
                        h3: 'h3Value',
                    },
                    multiValueHeaders: {

                        h1: ['h1ValueA', 'h1ValueB' ],
                    },
                    body: 'ok',
                    isBase64Encoded: false,
                },
            });
        });

        it( 'body: response (body, statusCode, setCookie, headers [multiple]) and httpMethod: GET, additionalHeaders', function() {

            const context = createContext( 'GET' );

            const statusCode = 202;

            const headers = {

                h1: 'h1ValueA',
                h2: 'h2Value',
            };

            const additionalHeaders = {

                h1: 'h1ValueB',
                h3: 'h3Value',
            };

            const setCookie = {

                name: 'first',
                value: 'cookie',
                options: {

                    domain: 'domain.name',
                    encode: encodeURIComponent,
                    expires: new Date(),

                    httpOnly: true,
                    maxAge: 1000,
                    path: '/',
                    sameSite: true,
                    secure: false,
                }
            };

            let resultObject = processResult( {

                    body: 'ok',
                    statusCode,
                    headers,
                    setCookie,
                }, context, additionalHeaders );

            expect( resultObject ).to.eql( {

                result: {
                    statusCode,
                    headers: {

                        h2: 'h2Value',
                        h3: 'h3Value',
                        'Set-Cookie': cookie.serialize( setCookie.name, setCookie.value, setCookie.options ),
                    },
                    multiValueHeaders: {

                        h1: ['h1ValueA', 'h1ValueB' ],
                    },
                    body: 'ok',
                    isBase64Encoded: false,
                },
            });
        });

        it( 'body: response (body, statusCode, setCookie [multiple], headers [multiple]) and httpMethod: GET, additionalHeaders', function() {

            const context = createContext( 'GET' );

            const statusCode = 202;

            const headers = {

                h1: 'h1ValueA',
                h2: 'h2Value',
            };

            const additionalHeaders = {

                h1: 'h1ValueB',
                h3: 'h3Value',
            };

            const setCookie1 = {

                name: 'first',
                value: 'cookie',
                options: {

                    domain: 'domain.name',
                    encode: encodeURIComponent,
                    expires: new Date(),

                    httpOnly: true,
                    maxAge: 1000,
                    path: '/',
                    sameSite: true,
                    secure: false,
                }
            };

            const setCookie2 = {

                name: 'second',
                value: 'cookie',
                options: {

                    domain: 'domain.name',
                    encode: encodeURIComponent,
                    expires: new Date(),

                    httpOnly: true,
                    maxAge: 1000,
                    path: '/',
                    sameSite: true,
                    secure: false,
                }
            };


            let resultObject = processResult( {

                    body: 'ok',
                    statusCode,
                    headers,
                    setCookie: [ setCookie1, setCookie2 ],
                }, context, additionalHeaders );

            expect( resultObject ).to.eql( {

                result: {
                    statusCode,
                    headers: {

                        h2: 'h2Value',
                        h3: 'h3Value',
                    },
                    multiValueHeaders: {

                        h1: ['h1ValueA', 'h1ValueB' ],
                        'Set-Cookie': [
                            cookie.serialize( setCookie1.name, setCookie1.value, setCookie1.options ),
                            cookie.serialize( setCookie2.name, setCookie2.value, setCookie2.options )
                        ],
                    },
                    body: 'ok',
                    isBase64Encoded: false,
                },
            });
        });
    });

    describe( '.processError', function() {

        const { processError } = responseProcessor;

        it( 'vanilla exception, no additional headers', function() {

            let resultObject = processError( new Error( 'bang' ) );

            expect( resultObject ).to.eql( {

                result: {

                    statusCode: 500,
                    headers: {},
                    body: '{"type":"Error","message":"bang"}',
                    isBase64Encoded: false
                },
            });
        });

        it( 'exception with status, no additional headers', function() {

            let error = new Error( 'bang' );
            error.status = 501;

            let resultObject = processError( error );

            expect( resultObject ).to.eql( {

                result: {

                    statusCode: 501,
                    headers: {},
                    body: '{"type":"Error","message":"bang"}',
                    isBase64Encoded: false
                },
            });
        });

        it( 'exception with statusCode, headers no additional headers', function() {

            let error = new Error( 'bang' );
            error.statusCode = 501;
            error.headers = {

                h1: ['h1ValueA', 'h1ValueB' ],
                h2: 'h2Value',
            };

            let resultObject = processError( error );

            expect( resultObject ).to.eql( {

                result: {

                    statusCode: 501,
                    headers: {

                        h2: 'h2Value',
                    },
                    multiValueHeaders: {

                        h1: ['h1ValueA', 'h1ValueB' ],
                    },
                    body: '{"type":"Error","message":"bang"}',
                    isBase64Encoded: false
                },
            });
        });

        it( 'exception with statusCode, headers and additional headers', function() {

            let error = new Error( 'bang' );
            error.statusCode = 501;

            error.headers = {

                h1: 'h1ValueA',
                h2: 'h2Value',
            };

            const additionalHeaders = {

                h1: 'h1ValueB',
                h3: 'h3Value',
            };

            let resultObject = processError( error, additionalHeaders );

            expect( resultObject ).to.eql( {

                result: {

                    statusCode: 501,
                    headers: {

                        h2: 'h2Value',
                        h3: 'h3Value',
                    },
                    multiValueHeaders: {

                        h1: ['h1ValueA', 'h1ValueB' ],
                    },
                    body: '{"type":"Error","message":"bang"}',
                    isBase64Encoded: false
                },
            });
        });
    });
});
