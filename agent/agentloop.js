const {
  analyseSituation,
  answerQuestions
} = require("../api/NextStepapi");

const { buildDecision } = require("./decisionEngine");
const { createTrace, addTrace } = require("./trace");

function formatAnalysis(analysis, trace) {
  const decision = buildDecision(analysis);

  if (decision.stage === "ASK") {
    addTrace(
      trace,
      "asking",
      "More information is required before making a recommendation.",
      { questions: decision.questions }
    );
  } else if (decision.stage === "SUPPORT") {
    addTrace(
      trace,
      "proposing",
      "The situation requires supportive guidance rather than automatic task execution."
    );
  } else if (decision.stage === "OUT_OF_SCOPE") {
    addTrace(
      trace,
      "proposing",
      "The request is outside the supported scope."
    );
  } else {
    addTrace(
      trace,
      "proposing",
      decision.action,
      {
        requiresConfirmation: decision.requiresConfirmation,
        reversible: decision.reversible
      }
    );

    if (decision.requiresConfirmation) {
      addTrace(
        trace,
        "asking",
        "User confirmation is required before executing this external action."
      );
    }
  }

  return {
    success: true,
    state: decision.stage,
    situationId: analysis.situation_id,
    version: analysis.version,
    mode: analysis.mode,
    summary: analysis.summary,
    questions: decision.questions || [],
    priorities: analysis.priorities || [],
    nextAction: analysis.next_action || null,
    recommendation: decision.action || null,
    requiresConfirmation: decision.requiresConfirmation || false,
    reversible: decision.reversible ?? true,
    riskFlags: analysis.risk_flags || [],
    confidence: analysis.confidence || null,
    changes: analysis.changes || [],
    trace
  };
}

async function runAgent(userText) {
  const trace = createTrace();

  addTrace(
    trace,
    "reasoning",
    "Analysing the user's situation."
  );

  const analysis = await analyseSituation(userText);

  addTrace(
    trace,
    "reasoning",
    "Identifying priorities, missing information and the suggested next action.",
    {
      priorities: analysis.priorities || [],
      riskFlags: analysis.risk_flags || []
    }
  );

  return formatAnalysis(analysis, trace);
}

async function answerAgentQuestions(situationId, answers) {
  const trace = createTrace();

  addTrace(
    trace,
    "reasoning",
    "Processing the user's clarification answers."
  );

  const analysis = await answerQuestions(situationId, answers);

  addTrace(
    trace,
    "reasoning",
    "Reassessing the situation using the newly supplied information."
  );

  return formatAnalysis(analysis, trace);
}

module.exports = {
  runAgent,
  answerAgentQuestions
};
