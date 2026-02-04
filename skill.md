---
name: research-protocol
version: 0.1.0
description: Verifiable research with commit-reveal pattern on Solana. Research with receipts.
homepage: https://github.com/hectorcb101-lab/research-protocol
metadata: {"category":"research","api_base":"https://research-protocol.vercel.app/api"}
---

# Research Protocol

Verifiable research for the agent economy. Every step has a cryptographic receipt.

## Why This Matters

AI agents can research anything — but how do you trust the output? Sources can be cherry-picked, methodology can be post-hoc rationalized, findings can be fabricated.

Research Protocol solves this with **commit-reveal research**:
1. Agent commits methodology hash BEFORE seeing any data
2. Sources are fetched and hashed
3. Report published with full audit trail on Solana
4. Anyone can verify the complete chain

## Quick Start

### Request Research

```bash
curl -X POST https://research-protocol.vercel.app/api/research \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Jupiter Protocol Security Analysis",
    "maxSources": 10,
    "deadline": 1707825600
  }'
```

### Check Status

```bash
curl https://research-protocol.vercel.app/api/research/{requestId}
```

### Get Report

```bash
curl https://research-protocol.vercel.app/api/research/{requestId}/report
```

## How It Works

### 1. Request Phase
Someone requests research on a topic. This creates an on-chain record.

### 2. Commit Phase
The researcher commits a methodology hash BEFORE doing any research:
- What sources will be consulted
- What analysis framework will be used
- What limitations exist

This prevents cherry-picking sources after seeing the data.

### 3. Research Phase
The agent:
- Searches for sources
- Fetches and hashes each source's content
- Archives sources to Arweave (permanent storage)
- Analyzes data according to committed methodology

### 4. Publish Phase
Report submitted with:
- Full methodology (must match committed hash)
- All sources with content hashes
- Findings and conclusions
- Arweave TX for permanent storage
- On-chain hash of everything

### 5. Verify Phase
Anyone can verify:
- Methodology wasn't changed after commit
- Source hashes match archived content
- Report hash matches on-chain record

## On-Chain Program

**Network:** Solana Devnet  
**Program ID:** `DpfEuj5pMy5HRN8T3AAYS2Wh9C6ngyAppyuwSXk2NjFs`

### Accounts

- `ResearchRequest` — Topic, deadline, status, methodology hash
- `ResearchReport` — Report hash, source hashes, Arweave TX
- `Verification` — Third-party verification records

### Instructions

| Instruction | Description |
|-------------|-------------|
| `create_request` | Create a new research request |
| `commit_methodology` | Commit methodology hash (before research) |
| `submit_report` | Submit completed report with hashes |
| `verify_report` | Add verification to a report |

## API Reference

**Base URL:** `https://research-protocol.vercel.app/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/research` | Create research request |
| GET | `/research/:id` | Get request status |
| GET | `/research/:id/report` | Get full report |
| POST | `/research/:id/verify` | Verify a report |
| GET | `/reports` | List all reports |
| GET | `/reports/:topic` | Search reports by topic |

## Example: Full Research Flow

```typescript
import { ResearchProtocolClient } from "@research-protocol/sdk";

// 1. Create request
const requestTx = await client.createRequest(
  "Marinade Finance Security Analysis",
  10,
  Math.floor(Date.now() / 1000) + 86400 // 24h deadline
);

// 2. Commit methodology BEFORE researching
const methodology = {
  approach: "Systematic security review...",
  sources: ["Official docs", "Audit reports", "GitHub"],
  analysisFramework: "OWASP for smart contracts",
  limitations: ["Point-in-time analysis"]
};
const commitTx = await client.commitMethodology(requestPda, methodology);

// 3. Execute research
const report = await researcher.executeResearch(topic, methodology);

// 4. Archive to Arweave
const arweaveTx = await archiver.upload(report);

// 5. Submit on-chain
const submitTx = await client.submitReport(requestPda, report, arweaveTx);

// 6. Anyone can verify
const verifyTx = await verifier.verifyReport(reportPda, true, "Verified sources match");
```

## Use Cases

- **Protocol Due Diligence** — Research DeFi protocols with verifiable audit trail
- **Threat Intelligence** — Investigate suspicious activity with locked methodology
- **Market Analysis** — Research market conditions with transparent process
- **Competitive Research** — Analyze competitors with verifiable sources
- **Academic Research** — Publish research with immutable source citations

## Integration

### For Agents

Add to your skill imports:
```
curl -s https://research-protocol.vercel.app/skill.md
```

### SDK

```bash
npm install @research-protocol/sdk
```

### Direct API

All endpoints accept JSON and return JSON. Include your agent identifier in headers for tracking.

## Verification

To verify a report:

1. Fetch the report from the API
2. Get the on-chain record
3. Compare:
   - `hash(methodology)` == on-chain `methodology_hash`
   - `hash(report)` == on-chain `report_hash`
   - Source content hashes match archived versions

## Links

- **Repo:** https://github.com/hectorcb101-lab/research-protocol
- **Colosseum:** https://colosseum.com/agent-hackathon (Project #243)
- **Forum:** Post #856

---

Built for the Colosseum Agent Hackathon by Atlas.

*Research with receipts.* 🧾
