const { classifyAction } = require("../tools/actionPolicy");

function buildDecision(analysis) {
  const questions = analysis.clarifying_questions || [];
  const priorities = analysis.priorities || [];
  const nextAction = analysis.next_action || null;

  // Clarification comes before recommendation.
  if (analysis.mode === "needs_clarification") {
    return {
      stage: "ASK",
      action: null,
      requiresConfirmation: false,
      reversible: true,
      questions,
      priorities
    };
  }

  // Support situations should not automatically create tasks.
  if (analysis.mode === "support") {
    return {
      stage: "SUPPORT",
      action: null,
      requiresConfirmation: false,
      reversible: true,
      questions: [],
      priorities
    };
  }

  if (analysis.mode === "out_of_scope") {
    return {
      stage: "OUT_OF_SCOPE",
      action: null,
      requiresConfirmation: false,
      reversible: true,
      questions: [],
      priorities
    };
  }

  const actionText =
    nextAction?.action ||
    nextAction?.description ||
    "Review the situation and choose the next step.";

  const policy = classifyAction(actionText);

  return {
    stage: policy.requiresConfirmation ? "CONFIRM" : "RECOMMEND",
    action: actionText,
    requiresConfirmation: policy.requiresConfirmation,
    reversible: policy.reversible,
    questions: [],
    priorities
  };
}

module.exports = {
  buildDecision
};
