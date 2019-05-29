/*
 * Copyright © 2018 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
    SoftwareDeliveryMachine,
    SoftwareDeliveryMachineConfiguration,
    CodeTransform,
    CodeInspection,
    AutoCodeInspection,
    goalContributors,
    onAnyPush,
    goals,
    Autofix,
} from "@atomist/sdm";
import {
    createSoftwareDeliveryMachine,
} from "@atomist/sdm-core";
import {
    Project,
    DefaultHttpClientFactory,
    NoParameters,
    projectUtils
} from "@atomist/automation-client";
import { InspectPipelineYmlCommand,
    AutoInspectPipelineYmlCommand,
    AutoInspectFailIfPipelineComments } from "./inspections";
import { AddPipelineYmlCommand, AddPipelineYmlAutofix } from "./transforms";


/**
 * Initialize an sdm definition, and add functionality to it.
 *
 * @param configuration All the configuration for this service
 */
export function machine(
    configuration: SoftwareDeliveryMachineConfiguration,
): SoftwareDeliveryMachine {

    const sdm = createSoftwareDeliveryMachine({
        name: "Empty Seed Software Delivery Machine",
        configuration,
    });

    //Manual inspection
    sdm.addCodeInspectionCommand(InspectPipelineYmlCommand);

    //Auto Inspection
    const codeInspection = new AutoCodeInspection();
    codeInspection.with(AutoInspectPipelineYmlCommand)
        .withListener(AutoInspectFailIfPipelineComments);

    //Manual transform
    sdm.addCodeTransformCommand(AddPipelineYmlCommand)

    // Auto Transform
    const autofixGoal = new Autofix().with(AddPipelineYmlAutofix)

    const baseGoals = goals("Base Goals").plan(codeInspection, autofixGoal);

    sdm.withPushRules(
        onAnyPush().setGoals(baseGoals)
    )

    return sdm;
}

//Update 2018 -> 2019

