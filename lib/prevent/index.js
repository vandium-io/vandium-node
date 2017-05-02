'use strict';

const utils = require( '../utils' );

const PREVENT_MODULES = [

    require( './eval' )
];

class PreventManager {

    constructor() {

        this.configure();
    }

    configure() {

        let preventState = {};

        for( let preventModule of PREVENT_MODULES ) {

            let env = 'VANDIUM_PREVENT_' + preventModule.name.toUpperCase();

            let op = utils.parseBoolean( process.env[ env ] || 'true' );   //(value.toString().toLowerCase() === 'true' );

            preventModule.block( op );

            preventState[ preventModule.name ] = op;
        }

        this._state = preventState;
    }

    get state() {

        return this._state;
    }
}

module.exports = new PreventManager();
