'use strict';

var stateData = { }

function getCurrentState() {

    return Object.assign( {}, stateData );
}

class Recorder {

    constructor( moduleName ) {

        this.moduleName = moduleName;
    }

    record( data ) {

        stateData[ this.moduleName ] = data;
    }
}

class State {

    constructor() {

        Object.defineProperty( this, 'current', {

            get: function() {

                return getCurrentState();
            }
        });
    }

    recorder( moduleName ) {

        return new Recorder( moduleName );
    }

    get() {

        return getCurrentState();
    }
}

const instance = new State();

module.exports = instance;
