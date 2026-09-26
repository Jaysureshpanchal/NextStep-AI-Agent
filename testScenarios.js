const {
  getScenarios
} = require("./api/NextStepapi");

async function run() {
  try {
    console.log("Fetching NextStep scenarios...\n");

    const response = await getScenarios();

    console.log("Raw API response:");
    console.log(JSON.stringify(response, null, 2));

    // The API may return scenarios inside an object
    const scenarios =
      Array.isArray(response)
        ? response
        : response.scenarios || [];

    console.log(
      `\nFound ${scenarios.length} scenarios.\n`
    );

    for (const scenario of scenarios) {
      console.log("=================================");
      console.log(
        `Scenario: ${scenario.id || scenario.scenario_id || "Unknown"}`
      );
      console.log(
        `Name: ${scenario.name || "Unnamed"}`
      );
      console.log(
        `Description: ${scenario.description || ""}`
      );
      console.log("=================================\n");
    }

  } catch (error) {
    console.error("Scenario test failed:");
    console.error(error.message);
  }
}

run();