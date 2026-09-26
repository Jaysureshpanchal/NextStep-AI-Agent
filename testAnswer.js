async function test() {
  // First analyse the situation
  const analyseResponse = await fetch(
    "http://localhost:5000/api/agent/analyse",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: "My laptop broke and I have an important submission tomorrow."
      })
    }
  );

  const analysis = await analyseResponse.json();

  console.log("\n--- FIRST ANALYSIS ---");
  console.log(JSON.stringify(analysis, null, 2));

  // Find the first question
  const firstQuestion = analysis.questions?.[0];

  if (!firstQuestion) {
    console.log("\nNo question was asked.");
    return;
  }

  console.log("\n--- ANSWERING ---");
  console.log(firstQuestion.question);

  // Answer the first question
  const answerResponse = await fetch(
    "http://localhost:5000/api/agent/answer",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        situationId: analysis.situationId,
        answers: [
          {
            question_id: firstQuestion.id,
            answer: firstQuestion.options?.[0] || "Yes"
          }
        ]
      })
    }
  );

  const updated = await answerResponse.json();

  console.log("\n--- UPDATED ANALYSIS ---");
  console.log(JSON.stringify(updated, null, 2));
}

test();