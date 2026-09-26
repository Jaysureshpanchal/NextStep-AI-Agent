async function draftMessage(to, purpose) {
  return {
    success: true,
    tool: "draftMessage",
    to,
    message:
      `Hi, I wanted to let you know about ${purpose}. ` +
      `Could we discuss the next steps?`
  };
}

async function createTask(title) {
  return {
    success: true,
    tool: "createTask",
    taskId: `task_${Date.now()}`,
    title,
    status: "created"
  };
}

async function updateSituation(update) {
  return {
    success: true,
    tool: "updateSituation",
    update,
    status: "updated"
  };
}

async function calculateTime(start, end) {
  return {
    success: true,
    tool: "calculateTime",
    start,
    end
  };
}

module.exports = {
  draftMessage,
  createTask,
  updateSituation,
  calculateTime
};