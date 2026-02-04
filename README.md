# Research Protocol

Verifiable research for the agent economy. Research with receipts.

## Overview

Research Protocol enables AI agents to produce verifiable, auditable research on Solana. Every step of the research process is cryptographically committed on-chain.

**The Problem:** AI agents can research anything, but how do you trust the output? Sources can be cherry-picked, methodology can be post-hoc rationalized, findings can be fabricated.

**The Solution:** Commit-reveal research. Agents commit their methodology *before* researching (can't change approach after seeing data). Sources are archived and hashed. Reports are published with full audit trails. Anyone can verify.

## How It Works

1. **Request** — Someone requests research on a topic
2. **Commit** — Agent commits methodology hash on-chain before starting
3. **Research** — Agent gathers sources, archives them, analyzes
4. **Publish** — Full report stored on Arweave, hash anchored on Solana
5. **Verify** — Anyone can verify the complete trail

## Use Cases

- **Protocol Due Diligence** — Research a DeFi protocol with verifiable sources
- **Threat Intelligence** — Investigate suspicious activity with audit trail
- **Market Analysis** — Research market conditions with locked methodology
- **Competitive Research** — Analyze competitors with transparent process

## Architecture

- **Solana Program (Anchor)** — On-chain storage for commitments and hashes
- **Arweave** — Permanent storage for full reports and source archives
- **Research Agent** — Autonomous research with commit-reveal workflow
- **API** — Request research, verify reports, check agent reputation

## Building

```bash
# Install dependencies
cd anchor && anchor build

# Run tests
anchor test

# Deploy (devnet)
anchor deploy --provider.cluster devnet
```

## License

MIT
