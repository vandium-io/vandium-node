'use strict';

const Pipeline = require( '../pipeline' );

const jwt = require( './jwt' );

const protect = require( './protect' );

const validation = require( './validation' );

const stages = require( '../stages' );

const pipelineInstance = buildPipeline();

function addValidationPipelineItem( pipeline, stage, validationModule ) {

    pipeline.add( stage, function( pipelineEvent, callback ) {

        try {

            pipelineEvent.session.updateStage( stage );

            validationModule.validate( pipelineEvent );

            callback();
        }
        catch( err ) {

            callback( err );
        }
    });
}

function buildPipeline() {

    let pipeline = new Pipeline();

    addValidationPipelineItem( pipeline, stages.JWT, jwt );
    addValidationPipelineItem( pipeline, stages.PROTECT, protect );
    addValidationPipelineItem( pipeline, stages.INPUT, validation );

    return pipeline;
}

module.exports = {

    pipeline: pipelineInstance,

    jwt,

    protect,

    validation,

    exec: require( './exec' )
};
