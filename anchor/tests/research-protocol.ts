import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ResearchProtocol } from "../target/types/research_protocol";
import { expect } from "chai";
import { createHash } from "crypto";

describe("research-protocol", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.ResearchProtocol as Program<ResearchProtocol>;

  const topic = "Solana DeFi Security Analysis";
  const methodology = "1. Gather top 10 protocols by TVL\n2. Analyze audit reports\n3. Check incident history";
  const methodologyHash = createHash("sha256").update(methodology).digest();

  it("Creates a research request", async () => {
    const [requestPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("request"), provider.wallet.publicKey.toBuffer(), Buffer.from(topic)],
      program.programId
    );

    const deadline = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now

    await program.methods
      .createRequest(topic, 10, new anchor.BN(deadline))
      .accounts({
        researchRequest: requestPda,
        requester: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const request = await program.account.researchRequest.fetch(requestPda);
    expect(request.topic).to.equal(topic);
    expect(request.status).to.deep.equal({ open: {} });
  });

  it("Commits methodology", async () => {
    const [requestPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("request"), provider.wallet.publicKey.toBuffer(), Buffer.from(topic)],
      program.programId
    );

    await program.methods
      .commitMethodology([...methodologyHash])
      .accounts({
        researchRequest: requestPda,
        researcher: provider.wallet.publicKey,
      })
      .rpc();

    const request = await program.account.researchRequest.fetch(requestPda);
    expect(request.status).to.deep.equal({ inProgress: {} });
    expect(request.methodologyHash).to.deep.equal([...methodologyHash]);
  });
});
