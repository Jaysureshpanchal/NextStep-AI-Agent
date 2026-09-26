const { getScenarios } = require("./api/NextStepapi");
const { runAgent } = require("./agent/agentloop");

async function run() {
  try {
    console.log("Fetching all scenarios...\n");

    const response = await getScenarios();

    const scenarios = Array.isArray(response)
      ? response
      : response.scenarios || [];

    console.log(`Found ${scenarios.length} scenarios.\n`);

    const results = [];

    for (const scenario of scenarios) {
      console.log("======================================");
      console.log(`SCENARIO: ${scenario.id}`);
      console.log(`TYPE: ${scenario.type}`);
      console.log("======================================");

      try {
        const result = await runAgent(scenario.input);

        const record = {
          scenarioId: scenario.id,
          type: scenario.type,
          input: scenario.input,
          state: result.state,
          mode: result.mode,
          summary: result.summary,
          recommendation: result.recommendation,
          requiresConfirmation:
            result.requiresConfirmation,
          riskFlags: result.riskFlags,
          trace: result.trace
        };

        results.push(record);

        console.log(`State: ${result.state}`);
        console.log(`Mode: ${result.mode}`);
        console.log(
          `Recommendation: ${result.recommendation || "None"}`
        );
        console.log(
          `Confirmation required: ${result.requiresConfirmation}`
        );

        console.log("\nTrace:");

        for (const step of result.trace) {
          console.log(
            `${step.step}. [${step.stage}] ${step.message}`
          );
        }

      } catch (error) {
        console.log(
          `ERROR: ${error.message}`
        );

        results.push({
          scenarioId: scenario.id,
          type: scenario.type,
          input: scenario.input,
          status: "error",
          error: error.message
        });
      }

      console.log("\n");
    }

    console.log("======================================");
    console.log("FINAL SCENARIO SUMMARY");
    console.log("======================================");

    for (const result of results) {
      console.log(
        `${result.scenarioId} → ${
          result.state || result.status
        }`
      );
    }

  } catch (error) {
    console.error(
      "Scenario runner failed:",
      error.message
    );
  }
}

run();