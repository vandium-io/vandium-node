'use strict';

const childProcess = require( 'child_process' );

const BENCHMARKS = [

    'loadtime_base',
    'loadtime_validation_only',
    'loadtime_jwt_only',
    'loadtime_jwt_validation',
];

function runBenchmark( index ) {

    if( index >= BENCHMARKS.length ) {

        // done
        return;
    }

    let moduleName = BENCHMARKS[ index ];

    let benchmark = childProcess.fork( './benchmark/' + moduleName );

    benchmark.on( 'exit', function() {

        process.nextTick( function() {

            runBenchmark( index + 1 );
        });
    });
}

runBenchmark( 0 );
