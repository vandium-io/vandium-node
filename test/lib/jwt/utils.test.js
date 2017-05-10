'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const utils = require( '../../../lib/jwt/utils' );

const NodeRSA = require('node-rsa');

const crypto = require( 'crypto' );

describe( 'lib/jwt/utils', function() {

    describe( '.resolveAlgorithm', function() {

        [ 'RS256', 'HS256', 'HS384', 'HS512' ].forEach( ( algorithm ) => {

            it( `algorithm is ${algorithm}`, function() {

                let alg = utils.resolveAlgorithm( algorithm );

                expect( alg ).to.equal( algorithm );
            });
        });

        it( 'fail when algorithm is unknown', function() {

            expect( utils.resolveAlgorithm.bind( null, 'whatever' ) ).to.throw( 'authentication error: jwt algorithm "whatever" is unsupported' );
        });

        it( 'fail when algorithm is missing', function() {

            expect( utils.resolveAlgorithm.bind( null ) ).to.throw( 'authentication error: missing algorithm' );
        });
    });


    describe( '.formatPublicKey', function() {

        const controlKey = '-----BEGIN CERTIFICATE-----\n' +
            'MIIC+DCCAeCgAwIBAgIJWWzat6EMiW/IMA0GCSqGSIb3DQEBBQUAMCMxITAfBgNV\n' +
            'BAMTGG11c2ljbGVzc29uYXBwLmF1dGgwLmNvbTAeFw0xNzAxMjcwMDE0MzJaFw0z\n' +
            'MDEwMDYwMDE0MzJaMCMxITAfBgNVBAMTGG11c2ljbGVzc29uYXBwLmF1dGgwLmNv\n' +
            'bTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALLGa6AxTe0CSirczxNN\n' +
            'W4217qXJxDhF+bbgfFADvSSBek8IkEqtptZgazlJPoo7iDlrwMUqyygNOyhpAmAj\n' +
            'NkOAuQk2BEt4wDuEZInK4wy1QqqZC84Lrf+PkTTGgopunFtqa29uW4WRFCE5k6+I\n' +
            'P3D66FheXSKQKn8+ZZDfiu/aosazyvl1fyzwq4K6dcxekwM4cQnaShIliehKE8e3\n' +
            'xIqNA1Mg8bYr5nUUPieoO9JKiJpNMEa12BM31kwAlRKToz73IgNmerF9rUJfUUuJ\n' +
            'RXICf0rh1V8pJZiOOeiD7vJkHTjXhQztK3tFQpY2Qw5TLizmxUILHEgK20WG+tWd\n' +
            'wocCAwEAAaMvMC0wDAYDVR0TBAUwAwEB/zAdBgNVHQ4EFgQU41br9S/UsyhFe2aL\n' +
            '5yEcCRRAPIMwDQYJKoZIhvcNAQEFBQADggEBAJLAf13gJA2foKOEXyWK/w9eESNz\n' +
            'Ocf5hj92bSaNjVhbaRD9c04CG8U3TDUtNtjLOOAkOFDqa1ZwpxlyC8vgH+bvrwDJ\n' +
            'UbR1LCj94n3gC17nBi31ZM5pGRk8eTxCjgy6lgaAw8YPzzNmIdOcc4bDFY2s5+ix\n' +
            'qM0WN9wAeekBx9bllS6TkX4ZP4+ls3I3WfBX5AcCZ3XCS2oSevzhH2b7RMgaHnZB\n' +
            'qMH3/ySkxZ3hr7jWC72mMYS5yNxsC77V80xqOPXE1IEfpGym3zBBXfjWSmUK3AS3\n' +
            'slGqC8NLb2GhZ2pMS/WJi3GpvwVic01XteHu0lb/w3sN93gnfMXHXigo9oI=\n' +
            '-----END CERTIFICATE-----\n'

        it( 'valid public key format', function() {

            let key = utils.formatPublicKey( controlKey );

            expect( key ).to.equal( controlKey );
        });

        it( 'valid public key format with extra spaces before new line', function() {

            let testKey = '       -----BEGIN CERTIFICATE-----\n' +
            'MIIC+DCCAeCgAwIBAgIJWWzat6EMiW/IMA0GCSqGSIb3DQEBBQUAMCMxITAfBgNV \n' +
            'BAMTGG11c2ljbGVzc29uYXBwLmF1dGgwLmNvbTAeFw0xNzAxMjcwMDE0MzJaFw0z \n' +
            'MDEwMDYwMDE0MzJaMCMxITAfBgNVBAMTGG11c2ljbGVzc29uYXBwLmF1dGgwLmNv \n' +
            'bTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALLGa6AxTe0CSirczxNN \n' +
            'W4217qXJxDhF+bbgfFADvSSBek8IkEqtptZgazlJPoo7iDlrwMUqyygNOyhpAmAj \n' +
            'NkOAuQk2BEt4wDuEZInK4wy1QqqZC84Lrf+PkTTGgopunFtqa29uW4WRFCE5k6+I \n' +
            'P3D66FheXSKQKn8+ZZDfiu/aosazyvl1fyzwq4K6dcxekwM4cQnaShIliehKE8e3 \n' +
            'xIqNA1Mg8bYr5nUUPieoO9JKiJpNMEa12BM31kwAlRKToz73IgNmerF9rUJfUUuJ \n' +
            'RXICf0rh1V8pJZiOOeiD7vJkHTjXhQztK3tFQpY2Qw5TLizmxUILHEgK20WG+tWd \n' +
            'wocCAwEAAaMvMC0wDAYDVR0TBAUwAwEB/zAdBgNVHQ4EFgQU41br9S/UsyhFe2aL \n' +
            '5yEcCRRAPIMwDQYJKoZIhvcNAQEFBQADggEBAJLAf13gJA2foKOEXyWK/w9eESNz \n' +
            'Ocf5hj92bSaNjVhbaRD9c04CG8U3TDUtNtjLOOAkOFDqa1ZwpxlyC8vgH+bvrwDJ \n' +
            'UbR1LCj94n3gC17nBi31ZM5pGRk8eTxCjgy6lgaAw8YPzzNmIdOcc4bDFY2s5+ix \n' +
            'qM0WN9wAeekBx9bllS6TkX4ZP4+ls3I3WfBX5AcCZ3XCS2oSevzhH2b7RMgaHnZB \n' +
            'qMH3/ySkxZ3hr7jWC72mMYS5yNxsC77V80xqOPXE1IEfpGym3zBBXfjWSmUK3AS3 \n' +
            'slGqC8NLb2GhZ2pMS/WJi3GpvwVic01XteHu0lb/w3sN93gnfMXHXigo9oI= \n' +
            '  -----END CERTIFICATE-----\n'

            let key = utils.formatPublicKey( testKey );

            expect( key ).to.equal( controlKey );
        });

        it( 'public key without armor', function() {

            let testKey = 'MIIC+DCCAeCgAwIBAgIJWWzat6EMiW/IMA0GCSqGSIb3DQEBBQUAMCMxITAfBgNV' +
            'BAMTGG11c2ljbGVzc29uYXBwLmF1dGgwLmNvbTAeFw0xNzAxMjcwMDE0MzJaFw0z' +
            'MDEwMDYwMDE0MzJaMCMxITAfBgNVBAMTGG11c2ljbGVzc29uYXBwLmF1dGgwLmNv' +
            'bTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALLGa6AxTe0CSirczxNN' +
            'W4217qXJxDhF+bbgfFADvSSBek8IkEqtptZgazlJPoo7iDlrwMUqyygNOyhpAmAj' +
            'NkOAuQk2BEt4wDuEZInK4wy1QqqZC84Lrf+PkTTGgopunFtqa29uW4WRFCE5k6+I' +
            'P3D66FheXSKQKn8+ZZDfiu/aosazyvl1fyzwq4K6dcxekwM4cQnaShIliehKE8e3' +
            'xIqNA1Mg8bYr5nUUPieoO9JKiJpNMEa12BM31kwAlRKToz73IgNmerF9rUJfUUuJ' +
            'RXICf0rh1V8pJZiOOeiD7vJkHTjXhQztK3tFQpY2Qw5TLizmxUILHEgK20WG+tWd' +
            'wocCAwEAAaMvMC0wDAYDVR0TBAUwAwEB/zAdBgNVHQ4EFgQU41br9S/UsyhFe2aL' +
            '5yEcCRRAPIMwDQYJKoZIhvcNAQEFBQADggEBAJLAf13gJA2foKOEXyWK/w9eESNz' +
            'Ocf5hj92bSaNjVhbaRD9c04CG8U3TDUtNtjLOOAkOFDqa1ZwpxlyC8vgH+bvrwDJ' +
            'UbR1LCj94n3gC17nBi31ZM5pGRk8eTxCjgy6lgaAw8YPzzNmIdOcc4bDFY2s5+ix' +
            'qM0WN9wAeekBx9bllS6TkX4ZP4+ls3I3WfBX5AcCZ3XCS2oSevzhH2b7RMgaHnZB' +
            'qMH3/ySkxZ3hr7jWC72mMYS5yNxsC77V80xqOPXE1IEfpGym3zBBXfjWSmUK3AS3' +
            'slGqC8NLb2GhZ2pMS/WJi3GpvwVic01XteHu0lb/w3sN93gnfMXHXigo9oI=';

            let key = utils.formatPublicKey( testKey );

            expect( key ).to.equal( controlKey );
        });

        it( 'generate key with armor', function() {


            const data = 'this is a something to sign';

            let keyPair = new NodeRSA({b: 512});

            let publicKey = keyPair.exportKey( 'public' );

            expect( publicKey.startsWith( '-----BEGIN PUBLIC KEY-----' ) ).to.be.true;

            let testKey = utils.formatPublicKey( publicKey );

            expect( testKey.startsWith( '-----BEGIN CERTIFICATE-----' ) ).to.be.true;

            let privateKey = keyPair.exportKey();

            const sign = crypto.createSign('RSA-SHA256');

            sign.write( data );
            sign.end();

            const signature = sign.sign( privateKey );

            const verify = crypto.createVerify('RSA-SHA256');

            verify.write( data );
            verify.end();

            expect( verify.verify( publicKey, signature ) ).to.be.true;
        });
    });
});
