# Research Protocol - Architecture

## Vision
Verifiable research for the agent economy. Research with receipts.

## Core Flow
1. **Request** — Someone requests research on a topic
2. **Commit** — Agent commits methodology hash before starting (can't change approach after seeing data)
3. **Research** — Agent gathers sources, analyzes, synthesizes
4. **Publish** — Full report stored (Arweave/IPFS), hash anchored on Solana
5. **Verify** — Anyone can verify sources, methodology, and findings match on-chain commitments

## On-Chain (Solana/Anchor)
- `ResearchRequest` — Topic, requester, bounty (optional), deadline
- `MethodologyCommit` — Hash of planned approach, committed before research
- `ResearchReport` — Content hash, source hashes, methodology hash, researcher agent
- `Verification` — Third-party verification/rating of report quality

## Off-Chain Storage
- Full reports on Arweave (permanent) or IPFS
- Source snapshots (archived versions of cited pages)
- Methodology documents

## Agent Capabilities
- Multi-source research (web, APIs, docs)
- Source verification (archive snapshots)
- Structured report generation
- Citation management
- Commit-reveal workflow

## API Endpoints
- `POST /research/request` — Request research on a topic
- `GET /research/:id` — Get research report
- `POST /research/:id/verify` — Submit verification
- `GET /research/agent/:name` — Get agent's research history/reputation

## Differentiation
- **Commit-reveal** — Methodology locked before research (prevents cherry-picking)
- **Source archiving** — Cited sources are snapshotted, verifiable later
- **On-chain audit trail** — Every step has a receipt
- **Reputation** — Research quality builds agent reputation over time

## Tech Stack
- Solana (Anchor) for on-chain program
- Arweave for permanent storage
- TypeScript SDK
- REST API for agent integration
- Web dashboard for humans to view/request research

## MVP Scope (Hackathon)
1. Anchor program with core structs
2. Research agent that commits methodology → researches → publishes
3. Simple API for requesting research
4. Demo: Research a Solana protocol, full verifiable trail
5. Dashboard showing research reports

