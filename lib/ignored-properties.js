'use strict';

var ignored = {};

function add( prop ) {

    ignored[ prop ] = true;
}

function remove( prop ) {

    delete ignored[ prop ];
}

function update( oldProp, newProp ) {

    if( oldProp !== newProp ) {

        remove( oldProp );
        add( newProp );
    }
}

function list() {

    return Object.keys( ignored );
}

module.exports = {

    add: add,

    remove: remove,

    update: update,

    list: list
};
