async function post(path, body) {
  const response = await fetch(
    `http://localhost:5000${path}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    }
  );

  return {
    status: response.status,
    data: await response.json()
  };
}

async function run() {
  console.log("\n=== NEXTSTEP FINAL SMOKE TEST ===\n");

  const analysis = await post(
    "/api/agent/analyse",
    {
      text: "My laptop broke and I have an important submission tomorrow."
    }
  );

  console.log("1. ANALYSE:", analysis.status);
  console.log(
    "   state:",
    analysis.data.state,
    "| mode:",
    analysis.data.mode
  );

  const proposal = await post(
    "/api/agent/propose",
    {
      tool: "draftMessage",
      to: "manager",
      purpose: "an important submission tomorrow"
    }
  );

  console.log(
    "2. PROPOSE:",
    proposal.status,
    "|",
    proposal.data.status
  );

  const actionId = proposal.data.action?.id;

  if (!actionId) {
    throw new Error("No action ID returned.");
  }

  const confirmation = await post(
    "/api/agent/confirm",
    {
      actionId,
      confirmed: true
    }
  );

  console.log(
    "3. CONFIRM:",
    confirmation.status,
    "|",
    confirmation.data.status
  );

  const duplicate = await post(
    "/api/agent/confirm",
    {
      actionId,
      confirmed: true
    }
  );

  console.log(
    "4. DUPLICATE:",
    duplicate.status,
    "|",
    duplicate.data.status
  );

  const reassess = await post(
    "/api/agent/reassess",
    {
      situationId:
        analysis.data.situationId || "demo-situation",
      update: "The submission deadline was extended."
    }
  );

  console.log(
    "5. REASSESS:",
    reassess.status,
    "|",
    reassess.data.status
  );

  if (
    analysis.status !== 200 ||
    proposal.status !== 200 ||
    confirmation.status !== 200 ||
    duplicate.data.status !== "already_executed" ||
    reassess.status !== 200
  ) {
    throw new Error("One or more smoke tests failed.");
  }

  console.log("\nALL SMOKE TESTS PASSED.\n");
}

run().catch(error => {
  console.error("\nSMOKE TEST FAILED:", error.message);
  process.exitCode = 1;
});
