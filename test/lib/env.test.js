'use strict';

/*jshint expr: true*/

const expect = require( 'chai' ).expect;

const freshy = require( 'freshy' );

const proxyquire = require( 'proxyquire' ).noCallThru();

const sinon = require( 'sinon' );

describe( 'lib/env', function() {

    beforeEach( function() {

        freshy.unload( '../../lib/env' );
    });

    afterEach( function() {

        delete process.env.VANDIUM_PARAM_STORE_PATH;

        freshy.unload( '../../lib/env' );
    });

    it( 'VANDIUM_PARAM_STORE_PATH exists', function() {

        process.env.VANDIUM_PARAM_STORE_PATH = '/services/whatever/env';

        let awsParamEnvStub = { load: sinon.stub() };

        proxyquire( '../../lib/env', {

            'aws-param-env': awsParamEnvStub
        });

        expect( awsParamEnvStub.load.calledOnce ).to.be.true;
        expect( awsParamEnvStub.load.firstCall.args ).to.eql( [ '/services/whatever/env' ] );
    });

    it( 'VANDIUM_PARAM_STORE_PATH not set', function() {

        let awsParamEnvStub = { load: sinon.stub() };

        proxyquire( '../../lib/env', {

            'aws-param-env': awsParamEnvStub
        });

        expect( awsParamEnvStub.load.called ).to.be.false;
    });
});
