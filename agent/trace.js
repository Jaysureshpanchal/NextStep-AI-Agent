function createTrace() {
  return [];
}

function addTrace(trace, stage, message, data = {}) {
  trace.push({
    step: trace.length + 1,
    stage,
    message,
    timestamp: new Date().toISOString(),
    data
  });
}

module.exports = {
  createTrace,
  addTrace
};