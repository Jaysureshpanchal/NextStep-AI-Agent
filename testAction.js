async function test() {
  console.log("\n--- PROPOSING ACTION ---");

  const proposeResponse = await fetch(
    "http://localhost:5000/api/agent/propose",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        tool: "draftMessage",
        to: "manager",
        purpose: "an important submission tomorrow"
      })
    }
  );

  const proposed = await proposeResponse.json();
  console.log(JSON.stringify(proposed, null, 2));

  if (!proposed.action?.id) {
    throw new Error("Action proposal failed.");
  }

  const actionId = proposed.action.id;

  console.log("\n--- CONFIRMING ACTION ---");

  const confirmResponse = await fetch(
    "http://localhost:5000/api/agent/confirm",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        actionId,
        confirmed: true
      })
    }
  );

  const result = await confirmResponse.json();
  console.log(JSON.stringify(result, null, 2));

  console.log("\n--- TRYING DUPLICATE EXECUTION ---");

  const duplicateResponse = await fetch(
    "http://localhost:5000/api/agent/confirm",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        actionId,
        confirmed: true
      })
    }
  );

  const duplicate = await duplicateResponse.json();
  console.log(JSON.stringify(duplicate, null, 2));

  if (duplicate.status !== "already_executed") {
    throw new Error(
      "Duplicate protection test failed."
    );
  }

  console.log("\nDUPLICATE PROTECTION: PASS");
}

test().catch(error => {
  console.error("\nTEST FAILED:", error.message);
  process.exitCode = 1;
});
