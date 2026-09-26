function classifyAction(actionText) {
  if (!actionText) {
    return {
      type: "none",
      reversible: true,
      requiresConfirmation: false
    };
  }

  const text = actionText.toLowerCase();

  // Irreversible / externally visible actions
  if (
    text.includes("send message") ||
    text.includes("send email") ||
    text.includes("delete") ||
    text.includes("submit") ||
    text.includes("cancel")
  ) {
    return {
      type: "external_action",
      reversible: false,
      requiresConfirmation: true
    };
  }

  // Reversible planning actions
  if (
    text.includes("draft") ||
    text.includes("plan") ||
    text.includes("review") ||
    text.includes("check")
  ) {
    return {
      type: "planning_action",
      reversible: true,
      requiresConfirmation: false
    };
  }

  return {
    type: "unknown",
    reversible: true,
    requiresConfirmation: true
  };
}

module.exports = {
  classifyAction
};