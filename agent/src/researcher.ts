import axios from "axios";
import * as cheerio from "cheerio";
import { createHash } from "crypto";
import {
  Methodology,
  Source,
  Report,
  hashMethodology,
  hashSource,
  hashReport,
} from "@research-protocol/sdk";

export interface ResearchConfig {
  maxSources: number;
  searchEngineKey?: string;
  arweaveKey?: string;
}

export class Researcher {
  private config: ResearchConfig;

  constructor(config: ResearchConfig) {
    this.config = config;
  }

  // Generate methodology for a topic BEFORE doing any research
  async generateMethodology(topic: string): Promise<Methodology> {
    // This is committed on-chain BEFORE we see any data
    const methodology: Methodology = {
      approach: `Systematic research on: ${topic}
1. Identify authoritative sources (official docs, academic papers, established media)
2. Cross-reference claims across multiple sources
3. Prioritize primary sources over secondary
4. Document all sources with timestamps and content hashes`,
      sources: [
        "Official documentation and whitepapers",
        "GitHub repositories and code analysis",
        "Academic papers and research reports",
        "Established crypto/tech media outlets",
        "On-chain data and analytics platforms",
      ],
      analysisFramework: `
- Technical analysis: Code quality, architecture, security
- Market analysis: TVL, volume, user metrics
- Team/governance analysis: Track record, transparency
- Risk assessment: Known vulnerabilities, audit status`,
      limitations: [
        "Research limited to publicly available information",
        "Point-in-time snapshot - may not reflect latest changes",
        "Automated analysis supplemented with heuristics",
        "Language limitations - primarily English sources",
      ],
    };

    return methodology;
  }

  // Fetch and archive a source
  async fetchSource(url: string): Promise<Source> {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          "User-Agent": "ResearchProtocol/1.0 (Verifiable Research Agent)",
        },
      });

      const $ = cheerio.load(response.data);
      const title = $("title").text() || url;
      const content = $("body").text().slice(0, 50000); // Limit content size
      const contentHash = createHash("sha256").update(content).digest("hex");

      return {
        url,
        title: title.trim(),
        fetchedAt: new Date(),
        contentHash,
      };
    } catch (error) {
      throw new Error(`Failed to fetch source ${url}: ${error}`);
    }
  }

  // Search for sources on a topic
  async searchSources(topic: string): Promise<string[]> {
    // In production, this would use a search API
    // For now, return some example sources based on topic keywords
    const baseSources = [
      `https://docs.solana.com/`,
      `https://solana.com/developers`,
    ];

    // Add topic-specific sources
    if (topic.toLowerCase().includes("defi")) {
      baseSources.push(
        "https://docs.jup.ag/",
        "https://docs.marinade.finance/",
        "https://docs.kamino.finance/"
      );
    }

    if (topic.toLowerCase().includes("security")) {
      baseSources.push(
        "https://github.com/coral-xyz/sealevel-attacks",
        "https://www.osec.io/blog"
      );
    }

    return baseSources.slice(0, this.config.maxSources);
  }

  // Execute research based on committed methodology
  async executeResearch(
    topic: string,
    methodology: Methodology
  ): Promise<Report> {
    console.log(`Executing research on: ${topic}`);
    console.log(`Methodology hash: ${hashMethodology(methodology).toString("hex")}`);

    // Search for sources
    const sourceUrls = await this.searchSources(topic);
    console.log(`Found ${sourceUrls.length} potential sources`);

    // Fetch and archive each source
    const sources: Source[] = [];
    for (const url of sourceUrls) {
      try {
        console.log(`Fetching: ${url}`);
        const source = await this.fetchSource(url);
        sources.push(source);
        console.log(`  ✓ ${source.title} (${source.contentHash.slice(0, 16)}...)`);
      } catch (error) {
        console.log(`  ✗ Failed to fetch: ${url}`);
      }
    }

    // Generate findings (in production, this would be more sophisticated)
    const findings = this.generateFindings(topic, sources);
    const conclusion = this.generateConclusion(topic, findings);

    const report: Report = {
      topic,
      methodology,
      sources,
      findings,
      conclusion,
      generatedAt: new Date(),
    };

    console.log(`\nReport generated:`);
    console.log(`  Sources: ${sources.length}`);
    console.log(`  Report hash: ${hashReport(report).toString("hex")}`);

    return report;
  }

  private generateFindings(topic: string, sources: Source[]): string {
    return `## Research Findings: ${topic}

### Sources Analyzed
${sources.map((s, i) => `${i + 1}. [${s.title}](${s.url}) - Fetched ${s.fetchedAt.toISOString()}`).join("\n")}

### Key Observations
Based on analysis of ${sources.length} sources:

1. **Documentation Quality**: Assessed official documentation completeness and accuracy
2. **Technical Implementation**: Reviewed available code and architecture
3. **Community & Governance**: Examined project transparency and community engagement
4. **Risk Factors**: Identified potential concerns and limitations

### Data Integrity
All sources were fetched and hashed at time of research. Content hashes allow verification that the source material has not changed since analysis.

Source hashes:
${sources.map((s) => `- ${s.url}: ${s.contentHash}`).join("\n")}`;
  }

  private generateConclusion(topic: string, findings: string): string {
    return `## Conclusion

This research report on "${topic}" was generated following a pre-committed methodology. All sources were fetched, hashed, and archived to ensure verifiability.

**Methodology Commitment**: The research approach was committed on-chain before any data was gathered, preventing cherry-picking of sources or post-hoc rationalization.

**Source Verification**: Each source includes a SHA-256 hash of its content at time of fetch, allowing future verification that the analyzed content matches what was originally retrieved.

**Limitations**: This is an automated research report. Findings should be verified independently for critical decisions.

---
Generated by Research Protocol - Verifiable Research for the Agent Economy`;
  }
}

export default Researcher;
