'use strict';

var stateData = { }

function getCurrentState() {

    return Object.assign( {}, stateData );
}

class Recorder {

    constructor( moduleName ) {

        this.pathParts = moduleName.split( '.' );
    }

    record( data ) {

        let obj = stateData;

        for( let i = 0; i < this.pathParts.length-1; i++ ) {

            let part = this.pathParts[i];

            if( obj[ part ] ) {

                obj = obj[ part ];
            }
            else {

                let next = {};

                obj[ part ] = next;

                obj = next;
            }
        }

        let key = this.pathParts[ this.pathParts.length-1 ];

        if( data ) {

            obj[ key ] = data;
        }
        else {

            delete obj[ key ];
        }
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

    record( moduleName, data ) {

        this.recorder( moduleName ).record( data );
    }

    get() {

        return getCurrentState();
    }
}

const instance = new State();

module.exports = instance;
