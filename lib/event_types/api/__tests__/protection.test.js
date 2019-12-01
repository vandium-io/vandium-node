const { expect } = require( 'chai' );

const sinon = require( 'sinon' );

const MODULE_PATH = 'lib/event_types/api/protection';

const Protection = require( '../protection' );

describe( MODULE_PATH, function() {

    describe( 'Protection', function() {

        describe( 'constructor', function() {

            it( 'no options', function() {

                let instance = new Protection();

                expect( instance.sql ).to.exist;
                expect( instance.sql.mode ).to.equal( 'report' );

                expect( instance.sections ).to.eql( [ 'queryStringParameters', 'body', 'pathParameters' ] );
            });

            it( 'with options', function() {

                let instance = new Protection( {

                    mode: 'fail',
                    queryStringParameters: false,
                    body: false,
                    pathParameters: false
                });

                expect( instance.sql ).to.exist;
                expect( instance.sql.mode ).to.equal( 'fail' );

                expect( instance.mongodb ).to.exist;
                expect( instance.mongodb.mode ).to.equal( 'fail' );

                expect( instance.sections ).to.eql( [] );
            });

            it( 'with sql mode option', function() {

                let instance = new Protection( {

                    mode: 'fail',
                    sql: 'report',
                    queryStringParameters: false,
                    body: 'whatever',
                    pathParameters: false
                });

                expect( instance.sql ).to.exist;
                expect( instance.sql.mode ).to.equal( 'report' );

                expect( instance.mongodb ).to.exist;
                expect( instance.mongodb.mode ).to.equal( 'fail' );

                expect( instance.sections ).to.eql( [ 'body' ] );
            });

            it( 'with mongodb mode option', function() {

                let instance = new Protection( {

                    mode: 'fail',
                    mongodb: 'report',
                    queryStringParameters: false,
                    body: 'whatever',
                    pathParameters: false
                });

                expect( instance.sql ).to.exist;
                expect( instance.sql.mode ).to.equal( 'fail' );

                expect( instance.mongodb ).to.exist;
                expect( instance.mongodb.mode ).to.equal( 'report' );

                expect( instance.sections ).to.eql( [ 'body' ] );
            });
        });

        describe( '.validate', function() {

            it( 'with sql and mongodb mode option', function() {

                let instance = new Protection( {

                    mode: 'fail',
                    sql: 'report',
                    queryStringParameters: false,
                });

                expect( instance.sql ).to.exist;
                expect( instance.sql.mode ).to.equal( 'report' );
                expect( instance.sections ).to.eql( [ 'body', 'pathParameters' ] );

                instance.sql.scan = sinon.stub();
                instance.mongodb.scan = sinon.stub();

                let event = {

                    stuff: {},

                    queryStringParameters: {

                        one: 1,
                        two: 2,
                    },

                    body: {

                        body1: "b1",
                        body2: "b2"
                    }
                }

                instance.validate( event );

                expect( instance.sql.scan.calledTwice ).to.be.true;
                expect( instance.sql.scan.firstCall.args ).to.eql( ["b1"] );
                expect( instance.sql.scan.secondCall.args ).to.eql( ["b2"] );

                expect( instance.mongodb.scan.calledTwice ).to.be.true;
                expect( instance.mongodb.scan.firstCall.args ).to.eql( ["b1"] );
                expect( instance.mongodb.scan.secondCall.args ).to.eql( ["b2"] );
            });
        });
    });
});
