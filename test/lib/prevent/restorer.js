var originalEval = eval;

function restore() {

    eval = originalEval;
}

module.exports = {

    restore: restore
};
