import {
    CodeInspection, CodeInspectionResult, CommandListenerInvocation, CodeInspectionRegistration, ReviewListener, PushImpactResponse, ReviewListenerRegistration
} from "@atomist/sdm";
import {
    Project,
    NoParameters,
    projectUtils,
    ProjectReview,
    ReviewComment
} from "@atomist/automation-client";

type PipelineYmlExists = boolean;

// Based on documentation from - https://docs.atomist.com/developer/inspect/

// Manually triggered inspection

//Does the inspection (Do)
const InspectForPipelineYml: CodeInspection<PipelineYmlExists, NoParameters> = async (p: Project) => {
    return await projectUtils.fileExists(p, "**/pipeline.yml")
}

//Builds the message about the inspection (Display)
function sendPipelineExistsMessage(results: Array<CodeInspectionResult<PipelineYmlExists>>, inv: CommandListenerInvocation){
    const message = results.map(r =>
        `${r.repoId.owner}/${r.repoId.repo} has a pipeline.yml file - ${r.result}`)
        .join("\n");
    return inv.addressChannels(message);
} 

//Brings wthe inspection and message together so can be registered against the SDM
export const InspectPipelineYmlCommand : CodeInspectionRegistration<PipelineYmlExists, NoParameters> = {
    name: "InspectPipelineYmlExists",
    description: "Pipeline Yml should exist",
    intent: "inspect pipeline yml",
    inspection: InspectForPipelineYml,
    onInspectionResults: sendPipelineExistsMessage,
};


// \Manually triggered inspection

// AutoInspect

// Do the inspcection and build the review
const AutoInspectForPipelineYml : CodeInspection<ProjectReview, NoParameters> = async (p: Project) =>{
    const ymlExists = await projectUtils.fileExists(p, "**/pipeline.yml")

    var comments: ReviewComment[] = [];

    if(!ymlExists){
        let rc : ReviewComment = {
            severity: "warn",
            detail: "project does not have a pipeline.yml file",
            category: "ci",
            subcategory: "azure-pipelines"
        };

        comments.push(rc);
    }

    return {repoId: p.id, comments};
}

//Process the review and determine whether to fail goals
const failGoalsIfDoesNotHavePipelineCommentsReviewListner: ReviewListener = async rli =>{
    if (rli.review.comments && rli.review.comments.length > 0) {
        await rli.addressChannels("The project does not have a pipeline.yml file");
        return PushImpactResponse.failGoals
    }
    return PushImpactResponse.proceed;
}

//Register the inspection to a command.
export const AutoInspectPipelineYmlCommand: CodeInspectionRegistration<ProjectReview, NoParameters> = {
    name: "InspectPipelineYmlExists",
    description: "Pipeline Yml should exist",
    intent: "autoinspect pipeline yml",
    inspection: AutoInspectForPipelineYml,
}

//Register a review listner
export const AutoInspectFailIfPipelineComments: ReviewListenerRegistration = {
    name: "Fail goals in pipeline inspections result in comments",
    listener: failGoalsIfDoesNotHavePipelineCommentsReviewListner,
};

// \Auto Inspect