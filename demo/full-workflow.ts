/**
 * Research Protocol - Full Workflow Demo
 * 
 * This demonstrates the commit-reveal pattern for verifiable research:
 * 1. Create research request
 * 2. Commit methodology BEFORE seeing any data
 * 3. Execute research
 * 4. Submit report with verification
 */

import { createHash } from "crypto";

// Simulate the full workflow
async function demo() {
  console.log("=".repeat(60));
  console.log("RESEARCH PROTOCOL - VERIFIABLE RESEARCH DEMO");
  console.log("=".repeat(60));
  
  const topic = "Jupiter Protocol Security Analysis";
  console.log(`\n📋 Topic: ${topic}\n`);

  // Step 1: Create methodology BEFORE research
  console.log("━".repeat(60));
  console.log("STEP 1: COMMIT METHODOLOGY (Before seeing any data)");
  console.log("━".repeat(60));
  
  const methodology = {
    approach: "Systematic security analysis of Jupiter Protocol",
    sources: [
      "Official Jupiter documentation",
      "GitHub repository and commit history", 
      "Audit reports from security firms",
      "On-chain transaction analysis",
      "Community forums and Discord"
    ],
    analysisFramework: `
      1. Smart contract architecture review
      2. Permission and access control analysis
      3. Known vulnerability patterns check
      4. Audit report findings review
      5. Historical incident analysis
    `,
    limitations: [
      "Point-in-time analysis",
      "Limited to public information",
      "Does not constitute financial advice"
    ]
  };

  const methodologyHash = createHash("sha256")
    .update(JSON.stringify(methodology))
    .digest("hex");

  console.log("\nMethodology defined:");
  console.log(`  Approach: ${methodology.approach}`);
  console.log(`  Sources: ${methodology.sources.length} source types`);
  console.log(`\n🔐 METHODOLOGY HASH (committed on-chain):`);
  console.log(`   ${methodologyHash}`);
  console.log("\n⚠️  This hash is NOW LOCKED. Cannot be changed.");
  console.log("   Any attempt to modify methodology will be detected.\n");

  // Step 2: Execute research
  console.log("━".repeat(60));
  console.log("STEP 2: EXECUTE RESEARCH (Following committed methodology)");
  console.log("━".repeat(60));

  // Simulate fetching sources
  const sources = [
    {
      url: "https://docs.jup.ag/",
      title: "Jupiter Documentation",
      fetchedAt: new Date().toISOString(),
      contentHash: createHash("sha256").update("jupiter-docs-content").digest("hex")
    },
    {
      url: "https://github.com/jup-ag/jupiter-core",
      title: "Jupiter Core Repository",
      fetchedAt: new Date().toISOString(),
      contentHash: createHash("sha256").update("jupiter-github-content").digest("hex")
    },
    {
      url: "https://osec.io/audits/jupiter",
      title: "OtterSec Audit Report",
      fetchedAt: new Date().toISOString(),
      contentHash: createHash("sha256").update("jupiter-audit-content").digest("hex")
    }
  ];

  console.log("\n📚 Sources fetched and hashed:");
  for (const source of sources) {
    console.log(`\n  ${source.title}`);
    console.log(`    URL: ${source.url}`);
    console.log(`    Fetched: ${source.fetchedAt}`);
    console.log(`    Content Hash: ${source.contentHash.slice(0, 32)}...`);
  }

  // Step 3: Generate report
  console.log("\n" + "━".repeat(60));
  console.log("STEP 3: GENERATE REPORT");
  console.log("━".repeat(60));

  const report = {
    topic,
    methodology,
    sources,
    findings: `
## Jupiter Protocol Security Analysis

### Overview
Jupiter is the leading DEX aggregator on Solana, routing trades across multiple 
liquidity sources for optimal execution.

### Security Assessment

**Smart Contract Architecture**
- Modular design with clear separation of concerns
- Upgrade authority properly secured
- Emergency pause functionality present

**Audit Status**
- Multiple audits from OtterSec, Halborn
- No critical vulnerabilities in recent audits
- Ongoing bug bounty program

**Risk Factors**
- Dependency on underlying DEX protocols
- Oracle manipulation risks (mitigated by multiple price feeds)
- Smart contract upgrade risks (standard for upgradeable contracts)

### Conclusion
Jupiter demonstrates strong security practices with multiple audits, 
active bug bounty, and proper access controls.
    `,
    conclusion: "Jupiter Protocol shows strong security posture based on audit history and architecture review.",
    generatedAt: new Date().toISOString()
  };

  const reportHash = createHash("sha256")
    .update(JSON.stringify(report))
    .digest("hex");

  console.log("\n📄 Report generated:");
  console.log(`   Topic: ${report.topic}`);
  console.log(`   Sources: ${report.sources.length}`);
  console.log(`   Generated: ${report.generatedAt}`);
  console.log(`\n🔐 REPORT HASH:`);
  console.log(`   ${reportHash}`);

  // Step 4: Verification
  console.log("\n" + "━".repeat(60));
  console.log("STEP 4: VERIFICATION");
  console.log("━".repeat(60));

  // Verify methodology wasn't changed
  const verifyMethodologyHash = createHash("sha256")
    .update(JSON.stringify(report.methodology))
    .digest("hex");

  const methodologyMatch = verifyMethodologyHash === methodologyHash;

  console.log("\n✅ VERIFICATION RESULTS:");
  console.log(`\n   Methodology Hash Match: ${methodologyMatch ? "✓ VERIFIED" : "✗ FAILED"}`);
  console.log(`     Committed: ${methodologyHash.slice(0, 32)}...`);
  console.log(`     In Report: ${verifyMethodologyHash.slice(0, 32)}...`);
  
  console.log(`\n   Source Hashes: ${sources.length} sources archived`);
  for (const source of sources) {
    console.log(`     ✓ ${source.url.slice(0, 40)}... → ${source.contentHash.slice(0, 16)}...`);
  }

  console.log("\n" + "━".repeat(60));
  console.log("WHAT THIS PROVES:");
  console.log("━".repeat(60));
  console.log(`
  1. METHODOLOGY LOCKED FIRST
     The research approach was committed on-chain BEFORE any data
     was gathered. This prevents cherry-picking sources.

  2. SOURCES ARCHIVED
     Each source was fetched and hashed at a specific time.
     Content hashes prove the exact data that was analyzed.

  3. FULL AUDIT TRAIL
     Anyone can verify:
     - Methodology hash matches what was committed
     - Source hashes match archived content
     - Report was generated from these specific inputs

  4. TAMPER-EVIDENT
     Any modification to methodology, sources, or report
     would produce different hashes and fail verification.
`);

  console.log("=".repeat(60));
  console.log("RESEARCH PROTOCOL - Research with receipts. 🧾");
  console.log("=".repeat(60));
}

demo().catch(console.error);
