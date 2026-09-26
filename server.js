const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { getScenarios } = require("./api/NextStepapi");
const agentRoutes = require("./routes/agent");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/agent", agentRoutes);
app.get("/", (req, res) => {
  res.json({
    message: "NextStep Agent server is running!"
  });
});

app.get("/test-api", async (req, res) => {
  try {
    const scenarios = await getScenarios();
    res.json(scenarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Could not connect to NextStep API"
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});