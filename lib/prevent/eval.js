const originalEval = global.eval;

function blockedEval( str ) {

    var err = new Error( 'security violation: eval() blocked' );
    err.input = [ str ];

    throw err;
}

function block( op ) {

    if( op === true ) {

        global.eval = blockedEval;
    }
    else {

        global.eval = originalEval;
    }
}

module.exports = {

    name: 'eval',
    block
};
