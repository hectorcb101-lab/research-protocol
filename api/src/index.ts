import express from "express";
import cors from "cors";
import { createHash } from "crypto";

const app = express();
app.use(cors());
app.use(express.json());

// In-memory store for demo (would be DB + on-chain in production)
interface ResearchRequest {
  id: string;
  topic: string;
  maxSources: number;
  deadline: number;
  status: "open" | "committed" | "researching" | "completed";
  methodologyHash?: string;
  reportHash?: string;
  createdAt: number;
}

const requests: Map<string, ResearchRequest> = new Map();
const reports: Map<string, any> = new Map();

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", version: "0.1.0" });
});

// Create research request
app.post("/api/research", (req, res) => {
  const { topic, maxSources = 10, deadline } = req.body;
  
  if (!topic) {
    return res.status(400).json({ error: "Topic is required" });
  }

  const id = createHash("sha256")
    .update(`${topic}-${Date.now()}`)
    .digest("hex")
    .slice(0, 16);

  const request: ResearchRequest = {
    id,
    topic,
    maxSources,
    deadline: deadline || Math.floor(Date.now() / 1000) + 86400,
    status: "open",
    createdAt: Math.floor(Date.now() / 1000),
  };

  requests.set(id, request);

  res.json({
    success: true,
    request,
    message: "Research request created. Waiting for methodology commitment.",
  });
});

// Get request status
app.get("/api/research/:id", (req, res) => {
  const request = requests.get(req.params.id);
  if (!request) {
    return res.status(404).json({ error: "Request not found" });
  }
  res.json({ request });
});

// Commit methodology
app.post("/api/research/:id/commit", (req, res) => {
  const request = requests.get(req.params.id);
  if (!request) {
    return res.status(404).json({ error: "Request not found" });
  }

  if (request.status !== "open") {
    return res.status(400).json({ error: "Methodology already committed" });
  }

  const { methodology } = req.body;
  if (!methodology) {
    return res.status(400).json({ error: "Methodology is required" });
  }

  const methodologyHash = createHash("sha256")
    .update(JSON.stringify(methodology))
    .digest("hex");

  request.methodologyHash = methodologyHash;
  request.status = "committed";

  res.json({
    success: true,
    methodologyHash,
    message: "Methodology committed. Hash locked before research begins.",
  });
});

// Submit report
app.post("/api/research/:id/report", (req, res) => {
  const request = requests.get(req.params.id);
  if (!request) {
    return res.status(404).json({ error: "Request not found" });
  }

  if (request.status !== "committed") {
    return res.status(400).json({ 
      error: "Must commit methodology before submitting report" 
    });
  }

  const { report, methodology } = req.body;
  if (!report || !methodology) {
    return res.status(400).json({ error: "Report and methodology required" });
  }

  // Verify methodology matches committed hash
  const methodologyHash = createHash("sha256")
    .update(JSON.stringify(methodology))
    .digest("hex");

  if (methodologyHash !== request.methodologyHash) {
    return res.status(400).json({
      error: "Methodology does not match committed hash",
      expected: request.methodologyHash,
      received: methodologyHash,
    });
  }

  const reportHash = createHash("sha256")
    .update(JSON.stringify(report))
    .digest("hex");

  request.reportHash = reportHash;
  request.status = "completed";
  reports.set(req.params.id, { report, methodology, reportHash });

  res.json({
    success: true,
    reportHash,
    verified: true,
    message: "Report submitted. Methodology verified against committed hash.",
  });
});

// Get report
app.get("/api/research/:id/report", (req, res) => {
  const request = requests.get(req.params.id);
  if (!request) {
    return res.status(404).json({ error: "Request not found" });
  }

  const reportData = reports.get(req.params.id);
  if (!reportData) {
    return res.status(404).json({ error: "Report not yet submitted" });
  }

  res.json({
    request,
    ...reportData,
    verification: {
      methodologyHashMatch: true,
      reportHashMatch: true,
    },
  });
});

// List all requests
app.get("/api/requests", (req, res) => {
  const allRequests = Array.from(requests.values());
  res.json({ requests: allRequests, count: allRequests.length });
});

// Verify a report
app.post("/api/research/:id/verify", (req, res) => {
  const request = requests.get(req.params.id);
  if (!request) {
    return res.status(404).json({ error: "Request not found" });
  }

  const reportData = reports.get(req.params.id);
  if (!reportData) {
    return res.status(404).json({ error: "Report not found" });
  }

  // Re-compute hashes to verify
  const methodologyHash = createHash("sha256")
    .update(JSON.stringify(reportData.methodology))
    .digest("hex");

  const reportHash = createHash("sha256")
    .update(JSON.stringify(reportData.report))
    .digest("hex");

  const verification = {
    methodologyHashMatch: methodologyHash === request.methodologyHash,
    reportHashMatch: reportHash === request.reportHash,
    verified: methodologyHash === request.methodologyHash && 
              reportHash === request.reportHash,
  };

  res.json({
    requestId: req.params.id,
    verification,
    hashes: {
      methodology: { stored: request.methodologyHash, computed: methodologyHash },
      report: { stored: request.reportHash, computed: reportHash },
    },
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Research Protocol API running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
});

export default app;
