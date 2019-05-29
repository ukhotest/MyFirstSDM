import {
    CodeTransform, CodeTransformRegistration, AutofixRegistration, not, hasFile,
} from "@atomist/sdm";
import {
    Project,
    DefaultHttpClientFactory,
    NoParameters,
} from "@atomist/automation-client";

// Add new file called "Pipeline.yml" with content "TODO"
const AddPipelineYmlTransform: CodeTransform = async (p: Project) => {
    return p.addFile("pipeline.yml", "TODO");
};


//Create a command linked to the intents. Calling this command creates the edit on a new pull request.
export const AddPipelineYmlCommand: CodeTransformRegistration<NoParameters> = {
        transform: AddPipelineYmlTransform,
        name: "add pipeline yml",
        description: "Add Azure Pipelines File",
        intent: ["add pipeline", "add pipeline file"],
}

export const AddPipelineYmlAutofix : AutofixRegistration = {
    name: "Add Azure Pipeline",
    transform: AddPipelineYmlTransform,
    pushTest: not(hasFile("pipeline.yml")),
    options: {
        ignoreFailure: false //failures in the transform will cause other later autofixes to not be applied if set to false
    }
}