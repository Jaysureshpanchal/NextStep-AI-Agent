const { randomUUID } = require("crypto");

const {
  draftMessage,
  createTask,
  updateSituation
} = require("../tools/mockTools");

const pendingActions = new Map();
const executedActions = new Map();

function createPendingAction(action) {
  const id = `action_${randomUUID()}`;

  const pending = {
    id,
    ...action,
    status: "pending",
    createdAt: new Date().toISOString()
  };

  pendingActions.set(id, pending);

  return pending;
}

function getPendingAction(id) {
  return pendingActions.get(id);
}

async function executeAction(id) {
  // Idempotent execution: a repeated confirmation must not
  // execute the external action a second time.
  const existing = executedActions.get(id);

  if (existing) {
    return {
      ...existing,
      duplicate: true,
      message:
        "Action was already executed. No duplicate execution performed."
    };
  }

  const action = pendingActions.get(id);

  if (!action) {
    throw new Error("Pending action not found.");
  }

  let result;

  if (action.tool === "draftMessage") {
    result = await draftMessage(action.to, action.purpose);
  } else if (action.tool === "createTask") {
    result = await createTask(action.title);
  } else if (action.tool === "updateSituation") {
    result = await updateSituation(action.update);
  } else {
    throw new Error(`Unknown tool: ${action.tool}`);
  }

  const executed = {
    actionId: id,
    status: "executed",
    result,
    executedAt: new Date().toISOString()
  };

  executedActions.set(id, executed);
  pendingActions.delete(id);

  return executed;
}

module.exports = {
  createPendingAction,
  getPendingAction,
  executeAction
};
