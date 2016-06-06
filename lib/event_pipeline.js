'use strict';

const stages = require( './stages' );

const plugins = require( './plugins' );

const jwt = plugins.jwt;

const validation = plugins.validation;

const protect = plugins.protect;

function executeStage( stage, pipelineEvent, processor, progressCallback ) {

    pipelineEvent.state = stage;
    progressCallback( pipelineEvent );

    processor.validate( pipelineEvent );
}

function process( event, progressCallback ) {

    let pipelineEvent = {

        event,

        ignored: []
    }

    executeStage( stages.JWT, pipelineEvent, jwt, progressCallback );
    executeStage( stages.PROTECT, pipelineEvent, protect, progressCallback );
    executeStage( stages.INPUT, pipelineEvent, validation, progressCallback );
}

module.exports = {

    process
};
