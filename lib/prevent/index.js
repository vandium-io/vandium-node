const { parseBoolean } = require( '../utils' );

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

            let op = parseBoolean( process.env[ env ] || 'false' );

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
