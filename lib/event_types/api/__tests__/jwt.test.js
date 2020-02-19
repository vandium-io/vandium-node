const { expect } = require( 'chai' );

const proxyquire = require( 'proxyquire' );

const sinon = require( 'sinon' );

const envRestorer = require( 'env-restorer' );

const { reset } = require( '../../../auth/auth' );


describe( 'lib/event_types/api/jwt', function() {

  describe( 'JWTValidator', function() {

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

    const keyWithoutArmor = 'MIIC+DCCAeCgAwIBAgIJWWzat6EMiW/IMA0GCSqGSIb3DQEBBQUAMCMxITAfBgNV' +
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

    const controlPublicKeyWithArmor = '-----BEGIN PUBLIC KEY-----\n' +
        'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAjHcU9OrRuZdy0q1olkrN\n' +
        'p0Ctl0gAi76ajBd3nyBLae6+IH7vnFrWSlWl3s66bLYT8fvy9lUt2hFA8ulsCvrw\n' +
        'IWNoWEUuxdao9KMKuK4n9MGQSDmgBQyDkG4qmIp6i7JZlkuTSPziJPMpS0SxbMp6\n' +
        'cSYZg7PiY7FOuKe5RDHvpvkQlvgdMjO/+dRguNvWw9E3lGe2WfwLy6bo0JVVl5Bu\n' +
        'nMRI7zKlBszVtA3nUd+XWa0rl+KrGxZGzkxs3Ep1C0HrbAPSE3KhBIJL7xFloMoo\n' +
        'NP//C98PY74F30pkbO38SqL7seezC5ZM89DEA7XHFysE+T42VBPH2lhaA5Dznwg/\n' +
        'qwIDAQAB\n' +
        '-----END PUBLIC KEY-----\n'

    let JWTValidator;

    let jwtStub;

    beforeEach( function() {

        // restore all env vars to defaults
        envRestorer.restore();

        reset();

        jwtStub = {

            decode: sinon.stub(),

            validateXSRF: sinon.stub()
        };

        JWTValidator = proxyquire( '../jwt', {

            '../../jwt': jwtStub
        });
    });

    describe( 'constructor', function() {

        it( 'fail when no options, no env vars set', function() {

            try {

              new JWTValidator();

              throw new Error( 'should not get here' );
            }
            catch( err ) {

              expect( err.message ).to.equal( 'authentication error: missing algorithm' );

            }
        });

        it( 'enabled = false', function() {

            let instance = new JWTValidator( { enabled: false } );

            expect( instance ).to.be.instanceof( JWTValidator );
            expect( instance.enabled ).to.be.false;
        });

        it( 'set to false', function() {

            const instance = new JWTValidator( false );

            expect( instance ).to.be.instanceof( JWTValidator );
            expect( instance.enabled ).to.be.false;
        });

        it( 'no options, env vars set for algorithm and secret', function() {

            process.env.VANDIUM_JWT_ALGORITHM = 'HS256';
            process.env.VANDIUM_JWT_SECRET = 'super-secret';

            let instance = new JWTValidator();

            expect( instance.enabled ).to.be.true;
            expect( instance.algorithm ).to.equal( 'HS256' );
            expect( instance.key ).to.equal( 'super-secret' );
            expect( instance.tokenPath ).to.eql( [ 'headers', 'Authorization' ] );
            expect( instance.xsrf ).to.be.false;
        });

        it( 'no options, env vars set for algorithm and key', function() {

            process.env.VANDIUM_JWT_ALGORITHM = 'HS256';
            process.env.VANDIUM_JWT_KEY = 'super-secret';

            let instance = new JWTValidator();

            expect( instance.enabled ).to.be.true;
            expect( instance.algorithm ).to.equal( 'HS256' );
            expect( instance.key ).to.equal( 'super-secret' );
            expect( instance.tokenPath ).to.eql( [ 'headers', 'Authorization' ] );
            expect( instance.xsrf ).to.be.false;
        });

        it( 'no options, env vars set for algorithm and publicKey', function() {

            process.env.VANDIUM_JWT_ALGORITHM = 'RS256';
            process.env.VANDIUM_JWT_PUBKEY = controlKey;

            let instance = new JWTValidator();

            expect( instance.enabled ).to.be.true;
            expect( instance.algorithm ).to.equal( 'RS256' );
            expect( instance.key ).to.equal( controlKey );
            expect( instance.tokenPath ).to.eql( [ 'headers', 'Authorization' ] );
            expect( instance.xsrf ).to.be.false;
        });

        it( 'no options, env vars set for algorithm (RS256) and key', function() {

            process.env.VANDIUM_JWT_ALGORITHM = 'RS256';
            process.env.VANDIUM_JWT_KEY = controlKey;

            let instance = new JWTValidator();

            expect( instance.enabled ).to.be.true;
            expect( instance.algorithm ).to.equal( 'RS256' );
            expect( instance.key ).to.equal( controlKey );
            expect( instance.tokenPath ).to.eql( [ 'headers', 'Authorization' ] );
            expect( instance.xsrf ).to.be.false;
        });

        it( 'no options, env vars set for algorithm (RS256) and key without armor', function() {

            process.env.VANDIUM_JWT_ALGORITHM = 'RS256';
            process.env.VANDIUM_JWT_KEY = keyWithoutArmor;

            let instance = new JWTValidator();

            expect( instance.enabled ).to.be.true;
            expect( instance.algorithm ).to.equal( 'RS256' );
            expect( instance.key ).to.equal( controlKey );
            expect( instance.tokenPath ).to.eql( [ 'headers', 'Authorization' ] );
            expect( instance.xsrf ).to.be.false;
        });

        it( 'no options, all env vars xsrf = true', function() {

            process.env.VANDIUM_JWT_ALGORITHM = 'HS256';
            process.env.VANDIUM_JWT_SECRET = 'super-secret';
            process.env.VANDIUM_JWT_USE_XSRF = 'TRUE';

            let instance = new JWTValidator();

            expect( instance.enabled ).to.be.true;
            expect( instance.algorithm ).to.equal( 'HS256' );
            expect( instance.key ).to.equal( 'super-secret' );
            expect( instance.tokenPath ).to.eql( [ 'headers', 'Authorization' ] );
            expect( instance.xsrf ).to.be.true;
            expect( instance.xsrfTokenPath ).to.eql( [ 'headers', 'xsrf' ] );
            expect( instance.xsrfClaimPath ).to.eql( ['nonce'] );
        });

        it( 'no options, all env vars set including xsrf', function() {

            process.env.VANDIUM_JWT_ALGORITHM = 'HS256';
            process.env.VANDIUM_JWT_SECRET = 'super-secret';
            process.env.VANDIUM_JWT_USE_XSRF = 'TRUE';
            process.env.VANDIUM_JWT_XSRF_TOKEN_PATH = 'queryParamters.xsrf';
            process.env.VANDIUM_JWT_XSRF_CLAIM_PATH = 'app-data.my-xsrf-token';
            process.env.VANDIUM_JWT_TOKEN_PATH = 'queryParamters.jwt';

            let instance = new JWTValidator();

            expect( instance.enabled ).to.be.true;
            expect( instance.algorithm ).to.equal( 'HS256' );
            expect( instance.key ).to.equal( 'super-secret' );
            expect( instance.tokenPath ).to.eql( [ 'queryParamters', 'jwt' ] );
            expect( instance.xsrf ).to.be.true;
            expect( instance.xsrfTokenPath ).to.eql( [ 'queryParamters', 'xsrf' ] );
            expect( instance.xsrfClaimPath ).to.eql( [ 'app-data', 'my-xsrf-token'] );
        });

        it( 'configure with jwk', function() {

          const jwk = {

            alg: 'RS256',
            e: 'AQAB',
            kid: '4fsZKEn++NgBOqrbtInEg62ykVmpJTWzHp7pQ8f3fz0=',
            kty: 'RSA',
            n: 'jHcU9OrRuZdy0q1olkrNp0Ctl0gAi76ajBd3nyBLae6-IH7vnFrWSlWl3s66bLYT8fvy9lUt2hFA8ulsCvrwIWNoWEUuxdao9KMKuK4n9MGQSDmgBQyDkG4qmIp6i7JZlkuTSPziJPMpS0SxbMp6cSYZg7PiY7FOuKe5RDHvpvkQlvgdMjO_-dRguNvWw9E3lGe2WfwLy6bo0JVVl5BunMRI7zKlBszVtA3nUd-XWa0rl-KrGxZGzkxs3Ep1C0HrbAPSE3KhBIJL7xFloMooNP__C98PY74F30pkbO38SqL7seezC5ZM89DEA7XHFysE-T42VBPH2lhaA5Dznwg_qw',
            use: 'sig'
          };

          const instance = new JWTValidator( { jwk } );

          expect( instance.enabled ).to.be.true;
          expect( instance.algorithm ).to.equal( 'RS256' );
          expect( instance.key ).to.equal( controlPublicKeyWithArmor );
        });

        it( 'no options, jwk in auth config', function() {

          const jwk = {

            alg: 'RS256',
            e: 'AQAB',
            kid: '4fsZKEn++NgBOqrbtInEg62ykVmpJTWzHp7pQ8f3fz0=',
            kty: 'RSA',
            n: 'jHcU9OrRuZdy0q1olkrNp0Ctl0gAi76ajBd3nyBLae6-IH7vnFrWSlWl3s66bLYT8fvy9lUt2hFA8ulsCvrwIWNoWEUuxdao9KMKuK4n9MGQSDmgBQyDkG4qmIp6i7JZlkuTSPziJPMpS0SxbMp6cSYZg7PiY7FOuKe5RDHvpvkQlvgdMjO_-dRguNvWw9E3lGe2WfwLy6bo0JVVl5BunMRI7zKlBszVtA3nUd-XWa0rl-KrGxZGzkxs3Ep1C0HrbAPSE3KhBIJL7xFloMooNP__C98PY74F30pkbO38SqL7seezC5ZM89DEA7XHFysE-T42VBPH2lhaA5Dznwg_qw',
            use: 'sig'
          };

          const authStub = {

            getConfig: sinon.stub().returns( { jwk } ),
          }

          JWTValidator = proxyquire( '../jwt', {

              '../../jwt': jwtStub,
              '../../auth': authStub,
          });

          const instance = new JWTValidator();

          expect( instance.enabled ).to.be.true;
          expect( instance.algorithm ).to.equal( 'RS256' );
          expect( instance.key ).to.equal( controlPublicKeyWithArmor );
        });

        it( 'options = true, jwk in auth config', function() {

          const jwk = {

            alg: 'RS256',
            e: 'AQAB',
            kid: '4fsZKEn++NgBOqrbtInEg62ykVmpJTWzHp7pQ8f3fz0=',
            kty: 'RSA',
            n: 'jHcU9OrRuZdy0q1olkrNp0Ctl0gAi76ajBd3nyBLae6-IH7vnFrWSlWl3s66bLYT8fvy9lUt2hFA8ulsCvrwIWNoWEUuxdao9KMKuK4n9MGQSDmgBQyDkG4qmIp6i7JZlkuTSPziJPMpS0SxbMp6cSYZg7PiY7FOuKe5RDHvpvkQlvgdMjO_-dRguNvWw9E3lGe2WfwLy6bo0JVVl5BunMRI7zKlBszVtA3nUd-XWa0rl-KrGxZGzkxs3Ep1C0HrbAPSE3KhBIJL7xFloMooNP__C98PY74F30pkbO38SqL7seezC5ZM89DEA7XHFysE-T42VBPH2lhaA5Dznwg_qw',
            use: 'sig'
          };

          const authStub = {

            getConfig: sinon.stub().returns( { jwk } ),
          }

          JWTValidator = proxyquire( '../jwt', {

              '../../jwt': jwtStub,
              '../../auth': authStub,
          });

          const instance = new JWTValidator( true );

          expect( instance.enabled ).to.be.true;
          expect( instance.algorithm ).to.equal( 'RS256' );
          expect( instance.key ).to.equal( controlPublicKeyWithArmor );
        });


        it( 'configure with options for HS algorithm with secret', function() {

            let instance = new JWTValidator( {

                algorithm: 'HS384',
                secret: 'my-super-secret',
                token: 'headers.JWT',
                xsrf: true,
                xsrfToken: 'headers.XSRF',
                xsrfClaim: 'xsrfHere'
            });

            expect( instance.enabled ).to.be.true;
            expect( instance.algorithm ).to.equal( 'HS384' );
            expect( instance.key ).to.equal( 'my-super-secret' );
            expect( instance.tokenPath ).to.eql( [ 'headers', 'JWT' ] );
            expect( instance.xsrf ).to.be.true;
            expect( instance.xsrfTokenPath ).to.eql( [ 'headers', 'XSRF' ] );
            expect( instance.xsrfClaimPath).to.eql( ['xsrfHere'] );
        });

        it( 'configure with options for RS algorithm with secret', function() {

            let instance = new JWTValidator( {

                algorithm: 'RS256',
                publicKey: controlKey,
                token: 'headers.JWT',
                xsrf: true,
                xsrfToken: 'headers.XSRF',
                xsrfClaim: 'xsrfHere'
            });

            expect( instance.enabled ).to.be.true;
            expect( instance.algorithm ).to.equal( 'RS256' );
            expect( instance.key ).to.equal( controlKey );
            expect( instance.tokenPath ).to.eql( [ 'headers', 'JWT' ] );
            expect( instance.xsrf ).to.be.true;
            expect( instance.xsrfTokenPath ).to.eql( [ 'headers', 'XSRF' ] );
            expect( instance.xsrfClaimPath ).to.eql( ['xsrfHere'] );
        });

        it( 'fail for jwk with unsupported algorithm', function() {

          const jwk = {

            alg: 'RS512',
            e: 'AQAB',
            kid: '4fsZKEn++NgBOqrbtInEg62ykVmpJTWzHp7pQ8f3fz0=',
            kty: 'RSA',
            n: 'jHcU9OrRuZdy0q1olkrNp0Ctl0gAi76ajBd3nyBLae6-IH7vnFrWSlWl3s66bLYT8fvy9lUt2hFA8ulsCvrwIWNoWEUuxdao9KMKuK4n9MGQSDmgBQyDkG4qmIp6i7JZlkuTSPziJPMpS0SxbMp6cSYZg7PiY7FOuKe5RDHvpvkQlvgdMjO_-dRguNvWw9E3lGe2WfwLy6bo0JVVl5BunMRI7zKlBszVtA3nUd-XWa0rl-KrGxZGzkxs3Ep1C0HrbAPSE3KhBIJL7xFloMooNP__C98PY74F30pkbO38SqL7seezC5ZM89DEA7XHFysE-T42VBPH2lhaA5Dznwg_qw',
            use: 'sig'
          };

          try {

            new JWTValidator( { jwk } );

            throw new Error( 'should not get here' );
          }
          catch( err ) {

            expect( err.message ).to.equal( 'Unsupported algorithm in JKS: RS512');
          }
        });

        it( 'fail for jwk with unsupported use', function() {

          const jwk = {

            alg: 'RS256',
            e: 'AQAB',
            kid: '4fsZKEn++NgBOqrbtInEg62ykVmpJTWzHp7pQ8f3fz0=',
            kty: 'RSA',
            n: 'jHcU9OrRuZdy0q1olkrNp0Ctl0gAi76ajBd3nyBLae6-IH7vnFrWSlWl3s66bLYT8fvy9lUt2hFA8ulsCvrwIWNoWEUuxdao9KMKuK4n9MGQSDmgBQyDkG4qmIp6i7JZlkuTSPziJPMpS0SxbMp6cSYZg7PiY7FOuKe5RDHvpvkQlvgdMjO_-dRguNvWw9E3lGe2WfwLy6bo0JVVl5BunMRI7zKlBszVtA3nUd-XWa0rl-KrGxZGzkxs3Ep1C0HrbAPSE3KhBIJL7xFloMooNP__C98PY74F30pkbO38SqL7seezC5ZM89DEA7XHFysE-T42VBPH2lhaA5Dznwg_qw',
            use: 'enc'
          };

          try {

            new JWTValidator( { jwk } );

            throw new Error( 'should not get here' );
          }
          catch( err ) {

            expect( err.message ).to.equal( 'Key is not set to signature use');
          }
        });

        it( 'fail when secret key is missing', function() {

            process.env.VANDIUM_JWT_ALGORITHM = 'HS256';

            try {

                new JWTValidator();

                throw new Error( 'should not get here' );
            }
            catch( err ) {

                expect( err.message ).to.equal( 'missing required jwt configuration value: secret' );
            }
        });

        it( 'fail when public key is missing', function() {

            process.env.VANDIUM_JWT_ALGORITHM = 'RS256';

            try {

                new JWTValidator();

                throw new Error( 'should not get here' );
            }
            catch( err ) {

                expect( err.message ).to.equal( 'missing required jwt configuration value: publicKey' );
            }
        });
    });

    describe( '.validate', function() {

        it( 'jwt disabled', function() {

            let instance = new JWTValidator( false );

            let event = {};

            instance.validate( event );

            expect( event ).to.eql( {} );

            expect( jwtStub.decode.called ).to.be.false;
            expect( jwtStub.validateXSRF.called ).to.be.false;
        });

        it( 'jwt enabled, no xsrf', function() {

            let instance = new JWTValidator( {

                algorithm: 'HS256',
                key: 'super-secret'
            });

            let event = {

                headers: {

                    Authorization: 'jwt-here'
                }
            };

            const decoded = { claim1: 1, claim2: 2 };

            jwtStub.decode.returns( decoded );

            instance.validate( event );

            expect( jwtStub.decode.calledOnce ).to.be.true;
            expect( jwtStub.decode.firstCall.args ).to.eql( [ 'jwt-here', 'HS256', 'super-secret' ] );

            expect( jwtStub.validateXSRF.called ).to.be.false;

            expect( event.jwt ).to.exist;
            expect( event.jwt ).to.eql( decoded );
        });

        it( 'jwt enabled, Bearer in header value', function() {

            let instance = new JWTValidator( {

                algorithm: 'HS256',
                key: 'super-secret',
                token: 'headers.Authorization'
            });

            let event = {

                headers: {

                  Authorization: 'Bearer jwt-here'
                }
            };

            const decoded = { claim1: 1, claim2: 2 };

            jwtStub.decode.returns( decoded );

            instance.validate( event );

            expect( jwtStub.decode.calledOnce ).to.be.true;
            expect( jwtStub.decode.firstCall.args ).to.eql( [ 'jwt-here', 'HS256', 'super-secret' ] );

            expect( jwtStub.validateXSRF.called ).to.be.false;

            expect( event.jwt ).to.exist;
            expect( event.jwt ).to.eql( decoded );
        });

        it( 'jwt enabled, with xsrf', function() {

            let instance = new JWTValidator( {

                algorithm: 'HS256',
                key: 'super-secret',
                xsrf: true,
                xsrfToken: 'headers.xsrf'
            });

            let event = {

                headers: {

                    Authorization: 'jwt-here',
                    xsrf: 'xsrfTokenHere'
                }
            };

            const decoded = { claim1: 1, claim2: 2 };

            jwtStub.decode.returns( decoded );

            instance.validate( event );

            expect( jwtStub.decode.calledOnce ).to.be.true;
            expect( jwtStub.decode.firstCall.args ).to.eql( [ 'jwt-here', 'HS256', 'super-secret' ] );

            expect( jwtStub.validateXSRF.calledOnce ).to.be.true;

            expect( jwtStub.validateXSRF.firstCall.args ).to.eql( [ decoded, 'xsrfTokenHere', ['nonce'] ] );

            expect( event.jwt ).to.exist;
            expect( event.jwt ).to.eql( decoded );
        });
    });
  });
});
