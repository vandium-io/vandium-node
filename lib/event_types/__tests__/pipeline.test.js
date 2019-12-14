const { should, expect } = require( 'chai' );

const sinon = require( 'sinon' );

const Pipeline = require( '../pipeline' );

describe( 'lib/event_types/pipeline', function() {

    describe( 'Pipeline', function() {

        describe( 'constructor', function() {

            it( 'normal operation', function() {

                const stages = [ 'one', 'two' ];
                const instance = new Pipeline( stages );

                expect( instance.executionOrder ).to.eql( stages );
                expect( instance.executionOrder ).to.not.equal( stages );

                expect( instance.handlers ).to.eql( {} );
            });
        });

        describe( '.stage', function() {

            it( 'normal operation', function() {

                const instance = new Pipeline( [ 'one', 'two' ] );

                expect( instance.handlers ).to.eql( {} );

                const myHandler = () => {};

                const retValue = instance.stage( 'two', myHandler );

                expect( retValue ).to.equal( instance );

                expect( instance.handlers ).to.eql( { two: myHandler } );
            });

            it( 'fail when stage not found', function() {

                const instance = new Pipeline( [ 'one', 'two' ] );

                expect( instance.handlers ).to.eql( {} );

                const myHandler = () => {};

                expect( instance.stage.bind( instance, 'three', myHandler ) ).to.throw( 'Invalid stage: three' );
            });
        });

        describe( 'executor', function() {

            it( 'normal operation, async', function() {

                const instance = new Pipeline( [ 'one', 'two' ] );

                const exec = instance.executor();

                expect( exec.run ).to.exist;
                expect( exec.run.constructor.name ).to.equal( 'AsyncFunction' );
            });

            it( 'normal operation, sync', function() {

                const instance = new Pipeline( [ 'one', 'two' ] );

                const exec = instance.executorSync();

                expect( exec.run ).to.exist;
                expect( exec.run.constructor.name ).to.equal( 'Function' );
            });
        });
    });

    describe( 'PipelineExecutorAsync', function() {

        describe( '.run', function() {

            it( 'normal operation', async function() {

                const instance = new Pipeline( [ 'one', 'two', 'three' ] );

                instance.stage( 'one', () => { return 1; } );
                instance.stage( 'three', async () => { return 3; } );

                const state = {};

                const executor = instance.executor();

                expect( executor.wasStageRun( 'one' ) ).to.be.false;

                const result = await executor.run( state );

                expect( result ).to.equal( 3 );

                expect( executor.wasStageRun( 'one' ) ).to.be.true;
                expect( executor.wasStageRun( 'two' ) ).to.be.true;
                expect( executor.wasStageRun( 'three' ) ).to.be.true;

                // unknown stages
                expect( executor.wasStageRun( 'four' ) ).to.be.false;
            });

            it( 'error condition', async function() {

                const instance = new Pipeline( [ 'one', 'two', 'three' ] );

                instance.stage( 'one', () => { return 1; } );
                instance.stage( 'two', async () =>

                    new Promise( (resolve, reject) => {

                        setTimeout( () => reject( new Error( 'bang' ) ), 20);
                    })
                );

                const state = {};

                const executor = instance.executor();

                try {

                    await executor.run( state );

                    throw new Error( 'should not return a result' );
                }
                catch( err ) {

                    expect( err.message ).to.equal( 'bang' );

                    expect( executor.wasStageRun( 'one' ) ).to.be.true;
                    expect( executor.wasStageRun( 'two' ) ).to.be.false;
                    expect( executor.wasStageRun( 'three' ) ).to.be.false;
                }
            });
        });
    });

    describe( 'PipelineExecutorSync', function() {

        describe( '.run', function() {

            it( 'normal operation', async function() {

                const instance = new Pipeline( [ 'one', 'two', 'three' ] );

                instance.stage( 'one', () => { return 1; } );
                instance.stage( 'three', async () => { return 3; } );

                const state = {};

                const executor = instance.executorSync();

                expect( executor.wasStageRun( 'one' ) ).to.be.false;

                const result = await executor.run( state );

                expect( result ).to.equal( 3 );

                expect( executor.wasStageRun( 'one' ) ).to.be.true;
                expect( executor.wasStageRun( 'two' ) ).to.be.true;
                expect( executor.wasStageRun( 'three' ) ).to.be.true;

                // unknown stages
                expect( executor.wasStageRun( 'four' ) ).to.be.false;
            });

            it( 'error condition', async function() {

                const instance = new Pipeline( [ 'one', 'two', 'three' ] );

                instance.stage( 'one', () => { return 1; } );
                instance.stage( 'two', () => { throw new Error( 'bang' ); } );

                const state = {};

                const executor = instance.executorSync();

                try {

                    await executor.run( state );

                    throw new Error( 'should not return a result' );
                }
                catch( err ) {

                    expect( err.message ).to.equal( 'bang' );

                    expect( executor.wasStageRun( 'one' ) ).to.be.true;
                    expect( executor.wasStageRun( 'two' ) ).to.be.false;
                    expect( executor.wasStageRun( 'three' ) ).to.be.false;
                }
            });
        });
    });
});
