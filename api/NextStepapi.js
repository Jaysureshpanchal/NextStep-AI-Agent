const { randomUUID } = require("crypto");

const BASE_URL = "https://nextstepmockapi.onrender.com";
const CANDIDATE_ID = process.env.CANDIDATE_ID;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function requestJson(url, options, retries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `API error ${response.status}${errorText ? `: ${errorText}` : ""}`
        );
      }

      const raw = await response.text();

      try {
        return JSON.parse(raw);
      } catch (parseError) {
        throw new Error(
          `Invalid JSON response: ${parseError.message}`
        );
      }
    } catch (error) {
      lastError = error;

      console.log(
        `API attempt ${attempt}/${retries} failed: ${error.message}`
      );

      if (attempt < retries) {
        await sleep(1000 * attempt);
      }
    }
  }

  throw lastError;
}

async function analyseSituation(text) {
  // One logical user action gets one idempotency key.
  // Retries reuse this same key so a successful server-side action
  // is not accidentally created twice.
  const idempotencyKey = randomUUID();

  return requestJson(
    `${BASE_URL}/v1/situations`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Candidate-Id": CANDIDATE_ID,
        "Idempotency-Key": idempotencyKey
      },
      body: JSON.stringify({
        text,
        locale: "en-IN",
        client_time: new Date().toISOString()
      })
    }
  );
}

async function answerQuestions(situationId, answers) {
  const idempotencyKey = randomUUID();

  return requestJson(
    `${BASE_URL}/v1/situations/${situationId}/answers`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Candidate-Id": CANDIDATE_ID,
        "Idempotency-Key": idempotencyKey
      },
      body: JSON.stringify({
        answers,
        client_time: new Date().toISOString()
      })
    }
  );
}

async function getScenarios() {
  return requestJson(
    `${BASE_URL}/v1/scenarios`,
    {
      method: "GET",
      headers: {
        "X-Candidate-Id": CANDIDATE_ID
      }
    }
  );
}

module.exports = {
  analyseSituation,
  answerQuestions,
  getScenarios
};
