'use strict';

const utils = require( './utils' );

const LOCATION_HEAD = '$head';

const LOCATION_TAIL = '$tail';

function executePipeline( pipelineEvent, item, results, resolve, reject ) {

    if( !item ) {

        return resolve( results );
    }

    let retValue = item.handler( pipelineEvent, ( err, result ) => {

        if( err ) {

            return reject( err );
        }

        results[ item.name ] = result;

        executePipeline( pipelineEvent, item.next, results, resolve, reject );
    });

    if( utils.isPromise( retValue ) ) {

        retValue.then( ( result ) => {

                results[ item.name ] = result;

                executePipeline( pipelineEvent, item.next, results, resolve, reject );
            })
            .catch( ( err ) => {

                reject( err );
            });
    }
}

class Pipeline {

    constructor() {

        this.handlers = {};
    }

    add( name, handler, location, before ) {

        if( !name ) {

            throw new Error( 'missing name' );
        }

        if( !handler ) {

            throw new Error( 'missing handler' );
        }

        if( !utils.isFunction( handler ) ) {

            throw new Error( 'invalid handler' );
        }

        let originalName = name;

        name = name.toLowerCase();

        if( this.handlers[ name ] ) {

            throw new Error( 'handler already exists with name: ' + originalName );
        }

        let originalLocation = location;

        if( !location ) {

            location = LOCATION_TAIL;
        }
        else {

            location = location.toLowerCase();
        }

        if( location === LOCATION_HEAD ) {

            if( !this.head ) {

                return this._addHead( name, handler );
            }

            return this._add( name, handler, this.head, before );
        }
        else if( location === LOCATION_TAIL ) {

            if( !this.head ) {

                return this._addHead( name, handler );
            }

            let nextItem = this.head;
            let lastItem = this.head;

            while( nextItem ) {

                lastItem = nextItem;
                nextItem = nextItem.next;
            }

            return this._add( name, handler, lastItem, before );
        }

        let insertItem = this.handlers[ location ];

        if( !insertItem ) {

            throw new Error( 'cannot find location: ' + originalLocation )
        }

        return this._add( name, handler, insertItem, before );
    }

    /**
     * @Promise
     */
    run( pipelineEvent ) {

        return new Promise( ( resolve, reject ) => {

            try {

                executePipeline( pipelineEvent, this.head, {}, resolve, reject );
            }
            catch( err ) {

                reject( err );
            }
        });
    }

    _addHead( name, handler ) {

        this.head = { name, handler };
        this.handlers[ name ] = this.head;

        return this;
    }

    _add( name, handler, insertItem, before ) {

        let item = { name, handler };

        this.handlers[ name ] = item;

        if( before ) {

            if( this.head === insertItem ) {

                this.head = item;
            }
            else {

                item.prev = insertItem.prev;
                insertItem.prev.next = item;
            }

            insertItem.prev = item;
            item.next = insertItem;
        }
        else {

            if( insertItem.next ) {

                item.next = insertItem.next;
                insertItem.next.prev = item;
            }

            insertItem.next = item;
            item.prev = insertItem;
        }

        return this;
    }
}

module.exports = Pipeline;
