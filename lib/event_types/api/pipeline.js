const buildPipeline = () => {

    const executionOrder = [

        'methodValidation',
        'eventNormalization',
        'bodyProcessing',
        'protection',
        'cookies',
        'jwt',
        'validation',
        'extractExecutor'
    ];

    // keep hidden
    let handlers = {};

    let pipeline = {

        setStage( stage, handler ) {

            if( !executionOrder.includes( stage ) ) {

                throw new Error( `Invalid stage: ${stage}` );
            }

            handlers[ stage ] = handler;
        },

        run: (state) => {

            executionOrder.forEach( (method) => {

                const handler = handlers[method];

                if( handler ) {

                    handler( state );
                }
            })
        }
    }

    return pipeline;
}

module.exports = {

    buildPipeline,
};
