'use strict';

const stages = require( './stages' );

const jwt = require( './jwt' );

const validation = require( './validation' );

const protect = require( './protect' );

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
