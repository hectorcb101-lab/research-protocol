const crypto = require('crypto');

// In-memory store (would use DB in production)
const requests = new Map();

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.json({
      requests: Array.from(requests.values()),
      count: requests.size
    });
  }

  if (req.method === 'POST') {
    const { topic, methodology } = req.body || {};
    
    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const id = crypto.randomBytes(8).toString('hex');
    const methodologyHash = methodology 
      ? crypto.createHash('sha256').update(JSON.stringify(methodology)).digest('hex')
      : null;

    const request = {
      id,
      topic,
      methodologyHash,
      status: methodologyHash ? 'committed' : 'open',
      createdAt: new Date().toISOString()
    };

    requests.set(id, request);

    return res.json({
      success: true,
      request,
      message: methodologyHash 
        ? "Methodology committed. Research can begin."
        : "Request created. Commit methodology to start."
    });
  }

  res.status(405).json({ error: "Method not allowed" });
};
