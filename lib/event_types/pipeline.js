
class Pipeline {

    constructor( stageOrder ) {

      this.handlers = new Map();

      stageOrder.forEach( (stage) => this.handlers.set( stage, () => {} ) );
    }

    stage( stageName, handler ) {

      if( !this.handlers.has( stageName ) ) {

        throw new Error( `Invalid stage: ${stageName}` );
      }

      this.handlers.set( stageName, handler );
      return this;
    }

    executor() {

        return new PipelineExecutorAsync( Array.from( this.handlers.entries() ) );
    }

    executorSync() {

        return new PipelineExecutorSync( Array.from( this.handlers.entries() ) );
    }
}

const noOpenHook = () => {};

class PipelineExecutorBase {

  constructor( handlers ) {

    this.handlers = handlers;

    this._resetExecState();
  }

  wasStageRun( stageName ) {

    const { stagesRun } = this.execState;

    return stagesRun.includes( stageName );
  }

  _resetExecState() {

    this.execState = {

      last: null,
      current: null,
      stagesRun: [],
    };
  }
}

function getHandlerExecs( stage, handler, hooks ) {

  const methodHook = hooks[ stage ] || {};

  const {

    before = noOpenHook,
    stub : handlerExec = handler,
    after = noOpenHook,

  } = methodHook;

  return [ before, handlerExec, after ];
}

class PipelineExecutorAsync extends PipelineExecutorBase {

  constructor( pipeline ) {

    super( pipeline );
  }

  async run( state ) {

    this._resetExecState();

    const { hooks = {} } = state;

    let lastResult;

    for( let [stage,stageHandler] of this.handlers ) {

      this.execState.current = stage;

      const [ beforeHandler, handler, afterHandler ] = getHandlerExecs( stage, stageHandler, hooks );

      beforeHandler( state, stage );

      lastResult = await handler( state );

      afterHandler( state, stage );

      this.execState.stagesRun.push( stage );
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

        const { hooks = {} } = state;

        let lastResult;

        for( let [stage,stageHandler] of this.handlers ) {

          this.execState.current = stage;

          const [ beforeHandler, handler, afterHandler ] = getHandlerExecs( stage, stageHandler, hooks );

          beforeHandler( state, stage );

          lastResult = handler( state );

          afterHandler( state, stage );

          this.execState.stagesRun.push( stage );
        }

        return lastResult;
    }
}

module.exports = Pipeline;
