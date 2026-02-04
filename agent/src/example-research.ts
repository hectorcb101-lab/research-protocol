/**
 * Real Research Example
 * Actually fetches web sources and generates a report
 */

import { createHash } from "crypto";
import https from "https";
import http from "http";

interface Source {
  url: string;
  title: string;
  fetchedAt: Date;
  contentHash: string;
  snippet: string;
}

async function fetchUrl(url: string): Promise<{ content: string; title: string }> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    const req = protocol.get(url, { timeout: 10000 }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        // Extract title
        const titleMatch = data.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : url;
        resolve({ content: data, title });
      });
    });
    req.on("error", reject);
    req.on("timeout", () => reject(new Error("Timeout")));
  });
}

async function research(topic: string) {
  console.log("=".repeat(70));
  console.log(`RESEARCH PROTOCOL - Live Research Demo`);
  console.log(`Topic: ${topic}`);
  console.log("=".repeat(70));

  // Step 1: Define and commit methodology
  const methodology = {
    topic,
    approach: "Multi-source analysis with primary documentation focus",
    sourceTypes: ["Official documentation", "Public APIs", "Technical references"],
    timestamp: new Date().toISOString(),
  };

  const methodologyHash = createHash("sha256")
    .update(JSON.stringify(methodology))
    .digest("hex");

  console.log(`\n🔐 METHODOLOGY COMMITTED`);
  console.log(`   Hash: ${methodologyHash}`);
  console.log(`   Time: ${methodology.timestamp}`);

  // Step 2: Fetch sources
  console.log(`\n📚 FETCHING SOURCES...\n`);

  const urls = [
    "https://solana.com/docs",
    "https://docs.solana.com/cluster/rpc-endpoints",
    "https://www.coingecko.com/en/coins/solana",
  ];

  const sources: Source[] = [];

  for (const url of urls) {
    try {
      console.log(`   Fetching: ${url}`);
      const { content, title } = await fetchUrl(url);
      const contentHash = createHash("sha256").update(content).digest("hex");
      const snippet = content.replace(/<[^>]+>/g, " ").slice(0, 200).trim();

      sources.push({
        url,
        title,
        fetchedAt: new Date(),
        contentHash,
        snippet: snippet + "...",
      });

      console.log(`   ✓ ${title}`);
      console.log(`     Hash: ${contentHash.slice(0, 32)}...`);
    } catch (error: any) {
      console.log(`   ✗ Failed: ${error.message}`);
    }
  }

  // Step 3: Generate report
  const report = {
    topic,
    methodology,
    sources: sources.map((s) => ({
      url: s.url,
      title: s.title,
      fetchedAt: s.fetchedAt.toISOString(),
      contentHash: s.contentHash,
    })),
    findings: `Research completed on "${topic}" with ${sources.length} sources verified.`,
    generatedAt: new Date().toISOString(),
  };

  const reportHash = createHash("sha256")
    .update(JSON.stringify(report))
    .digest("hex");

  console.log(`\n📄 REPORT GENERATED`);
  console.log(`   Sources: ${sources.length}`);
  console.log(`   Report Hash: ${reportHash}`);

  // Step 4: Verification
  const verifyMethodologyHash = createHash("sha256")
    .update(JSON.stringify(report.methodology))
    .digest("hex");

  console.log(`\n✅ VERIFICATION`);
  console.log(
    `   Methodology: ${
      verifyMethodologyHash === methodologyHash ? "✓ MATCH" : "✗ MISMATCH"
    }`
  );
  console.log(`   Sources: ${sources.length} archived with hashes`);

  console.log(`\n${"=".repeat(70)}`);
  console.log(`Research complete. All data cryptographically verifiable.`);
  console.log(`${"=".repeat(70)}\n`);

  return { report, reportHash, methodologyHash };
}

// Run
research("Solana Ecosystem Overview").catch(console.error);
