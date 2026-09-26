const express = require("express");

const {
  createPendingAction,
  getPendingAction,
  executeAction
} = require("../agent/actionManager");

const {
  runAgent,
  answerAgentQuestions
} = require("../agent/agentloop");

const router = express.Router();

// Analyse a new situation
router.post("/analyse", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({
        error: "Please provide a situation in the 'text' field."
      });
    }

    const result = await runAgent(text);
    res.json(result);
  } catch (error) {
    console.error("Agent error:", error);

    res.status(500).json({
      error: "The agent could not analyse the situation.",
      details: error.message
    });
  }
});

// Answer a clarification question
router.post("/answer", async (req, res) => {
  try {
    const { situationId, answers } = req.body;

    if (!situationId || !Array.isArray(answers)) {
      return res.status(400).json({
        error: "situationId and answers are required."
      });
    }

    const result = await answerAgentQuestions(
      situationId,
      answers
    );

    res.json(result);
  } catch (error) {
    console.error("Answer error:", error);

    res.status(500).json({
      error: "Could not process the answer.",
      details: error.message
    });
  }
});

// Create a pending action
router.post("/propose", async (req, res) => {
  try {
    const {
      tool,
      to,
      purpose,
      title,
      update
    } = req.body;

    const action = createPendingAction({
      tool,
      to,
      purpose,
      title,
      update
    });

    res.json({
      success: true,
      status: "pending_confirmation",
      action
    });
  } catch (error) {
    console.error("Proposal error:", error);

    res.status(500).json({
      error: "Could not create action.",
      details: error.message
    });
  }
});

// View pending action
router.get("/action/:id", (req, res) => {
  const action = getPendingAction(req.params.id);

  if (!action) {
    return res.status(404).json({
      error: "Action not found."
    });
  }

  res.json({
    success: true,
    action
  });
});

// Confirm and execute
router.post("/confirm", async (req, res) => {
  try {
    const { actionId, confirmed } = req.body;

    if (!actionId) {
      return res.status(400).json({
        error: "actionId is required."
      });
    }

    if (confirmed !== true) {
      return res.json({
        success: true,
        status: "cancelled",
        message: "Action was not executed."
      });
    }

    const result = await executeAction(actionId);

    res.json({
      success: true,
      status: result.duplicate ? "already_executed" : "executed",
      result
    });
  } catch (error) {
    console.error("Execution error:", error);

    res.status(500).json({
      error: "Could not execute action.",
      details: error.message
    });
  }
});

// Reassess the situation after an action or new information
router.post("/reassess", async (req, res) => {
  try {
    const { situationId, update } = req.body;

    if (!situationId || !update) {
      return res.status(400).json({
        error: "situationId and update are required."
      });
    }

    res.json({
      success: true,
      status: "reassessed",
      situationId,
      update,
      message:
        "Situation updated. The agent should reconsider priorities and next steps."
    });
  } catch (error) {
    console.error("Reassessment error:", error);

    res.status(500).json({
      error: "Could not reassess situation.",
      details: error.message
    });
  }
});

module.exports = router;
