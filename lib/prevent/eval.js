// can't use strict here

var originalEval = eval;

eval = function( str ) {

    var err = new Error( 'security violation: eval() blocked' );
    err.input = [ str ];

    throw err;
}
