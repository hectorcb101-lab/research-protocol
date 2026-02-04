import { Program, AnchorProvider, web3, BN } from "@coral-xyz/anchor";
import { createHash } from "crypto";

// Types
export interface ResearchRequest {
  requester: web3.PublicKey;
  topic: string;
  maxSources: number;
  deadline: BN;
  status: RequestStatus;
  createdAt: BN;
  researcher: web3.PublicKey | null;
  methodologyHash: number[] | null;
  methodologyCommittedAt: BN | null;
  completedAt: BN | null;
}

export interface ResearchReport {
  request: web3.PublicKey;
  researcher: web3.PublicKey;
  reportHash: number[];
  sourceHashes: number[][];
  sourceCount: number;
  arweaveTx: string;
  submittedAt: BN;
  verified: boolean;
  verificationCount: number;
}

export type RequestStatus = "open" | "inProgress" | "completed" | "cancelled";

export interface Methodology {
  approach: string;
  sources: string[];
  analysisFramework: string;
  limitations: string[];
}

export interface Source {
  url: string;
  title: string;
  fetchedAt: Date;
  contentHash: string;
  archived?: string; // Arweave TX
}

export interface Report {
  topic: string;
  methodology: Methodology;
  sources: Source[];
  findings: string;
  conclusion: string;
  generatedAt: Date;
}

// Utility functions
export function hashContent(content: string): Buffer {
  return createHash("sha256").update(content).digest();
}

export function hashMethodology(methodology: Methodology): Buffer {
  return hashContent(JSON.stringify(methodology));
}

export function hashSource(source: Source): Buffer {
  return hashContent(JSON.stringify({
    url: source.url,
    contentHash: source.contentHash,
    fetchedAt: source.fetchedAt.toISOString()
  }));
}

export function hashReport(report: Report): Buffer {
  return hashContent(JSON.stringify(report));
}

// Client class
export class ResearchProtocolClient {
  private program: Program;
  private provider: AnchorProvider;

  constructor(program: Program, provider: AnchorProvider) {
    this.program = program;
    this.provider = provider;
  }

  // Find PDA for research request
  findRequestPDA(requester: web3.PublicKey, topic: string): [web3.PublicKey, number] {
    return web3.PublicKey.findProgramAddressSync(
      [Buffer.from("request"), requester.toBuffer(), Buffer.from(topic)],
      this.program.programId
    );
  }

  // Find PDA for research report
  findReportPDA(request: web3.PublicKey): [web3.PublicKey, number] {
    return web3.PublicKey.findProgramAddressSync(
      [Buffer.from("report"), request.toBuffer()],
      this.program.programId
    );
  }

  // Find PDA for verification
  findVerificationPDA(report: web3.PublicKey, verifier: web3.PublicKey): [web3.PublicKey, number] {
    return web3.PublicKey.findProgramAddressSync(
      [Buffer.from("verification"), report.toBuffer(), verifier.toBuffer()],
      this.program.programId
    );
  }

  // Create a research request
  async createRequest(
    topic: string,
    maxSources: number,
    deadlineUnix: number
  ): Promise<string> {
    const requester = this.provider.wallet.publicKey;
    const [requestPda] = this.findRequestPDA(requester, topic);

    const tx = await this.program.methods
      .createRequest(topic, maxSources, new BN(deadlineUnix))
      .accounts({
        researchRequest: requestPda,
        requester,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  // Commit methodology before researching
  async commitMethodology(
    requestPda: web3.PublicKey,
    methodology: Methodology
  ): Promise<string> {
    const methodologyHash = hashMethodology(methodology);

    const tx = await this.program.methods
      .commitMethodology([...methodologyHash])
      .accounts({
        researchRequest: requestPda,
        researcher: this.provider.wallet.publicKey,
      })
      .rpc();

    return tx;
  }

  // Submit completed research report
  async submitReport(
    requestPda: web3.PublicKey,
    report: Report,
    arweaveTx: string
  ): Promise<string> {
    const [reportPda] = this.findReportPDA(requestPda);
    const reportHash = hashReport(report);
    const sourceHashes = report.sources.map(s => [...hashSource(s)]);

    const tx = await this.program.methods
      .submitReport([...reportHash], sourceHashes, arweaveTx)
      .accounts({
        researchRequest: requestPda,
        researchReport: reportPda,
        researcher: this.provider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  // Verify a research report
  async verifyReport(
    reportPda: web3.PublicKey,
    isValid: boolean,
    notes?: string
  ): Promise<string> {
    const verifier = this.provider.wallet.publicKey;
    const [verificationPda] = this.findVerificationPDA(reportPda, verifier);
    const notesHash = notes ? [...hashContent(notes)] : null;

    const tx = await this.program.methods
      .verifyReport(isValid, notesHash)
      .accounts({
        researchReport: reportPda,
        verification: verificationPda,
        verifier,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  // Fetch research request
  async getRequest(requestPda: web3.PublicKey): Promise<ResearchRequest | null> {
    try {
      return await this.program.account.researchRequest.fetch(requestPda) as ResearchRequest;
    } catch {
      return null;
    }
  }

  // Fetch research report
  async getReport(reportPda: web3.PublicKey): Promise<ResearchReport | null> {
    try {
      return await this.program.account.researchReport.fetch(reportPda) as ResearchReport;
    } catch {
      return null;
    }
  }
}

export default ResearchProtocolClient;
