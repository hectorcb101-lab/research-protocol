module.exports = (req, res) => {
  res.json({
    status: "ok",
    name: "Research Protocol API",
    version: "0.1.0",
    endpoints: [
      "GET /api/health",
      "GET /api/research",
      "POST /api/research",
      "GET /api/research/:id"
    ]
  });
};
