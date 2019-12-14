class Pipeline {

    constructor( stageOrder ) {

        this.executionOrder = [ ...stageOrder ];

        this.handlers = {};
    }

    stage( stageName, handler ) {

        if( !this.executionOrder.includes( stageName ) ) {

            throw new Error( `Invalid stage: ${stageName}` );
        }

        this.handlers[ stageName ] = handler;
        return this;
    }

    executor() {

        return new PipelineExecutorAsync( this );
    }

    executorSync() {

        return new PipelineExecutorSync( this );
    }
}

class PipelineExecutorBase {

    constructor( pipeline ) {

        this.executionOrder = [ ...pipeline.executionOrder ];
        this.handlers = { ...pipeline.handlers };

        this._resetExecState();
    }

    wasStageRun( stageName ) {

        const { last } = this.execState;

        if( last ) {

            const lastIndex = this.executionOrder.indexOf( last );
            const stageIndex = this.executionOrder.indexOf( stageName );

            if( lastIndex > -1 && stageIndex > -1 ) {

                return (lastIndex >= stageIndex);
            }
        }

        return false;
    }

    _resetExecState() {

        this.execState = {

            last: null,
            current: null,
        };
    }
}

class PipelineExecutorAsync extends PipelineExecutorBase {

    constructor( pipeline ) {

        super( pipeline );
    }

    async run( state ) {

        this._resetExecState();

        let lastResult;

        for( let method of this.executionOrder ) {

            const handler = this.handlers[method];

            if( handler ) {

                this.execState.current = method;

                lastResult = await handler( state );

                this.execState.last = method;
            }
        }

        return lastResult;
    }
}

class PipelineExecutorSync extends PipelineExecutorBase {

    constructor( pipeline ) {

        super( pipeline );
    }

    run( state ) {

        this._resetExecState();

        let lastResult;

        for( let method of this.executionOrder ) {

            const handler = this.handlers[method];

            if( handler ) {

                this.execState.current = method;

                lastResult = handler( state );

                this.execState.last = method;
            }
        }

        return lastResult;
    }
}

module.exports = Pipeline;
