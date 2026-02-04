use anchor_lang::prelude::*;

declare_id!("ResearchProtoco111111111111111111111111111");

#[program]
pub mod research_protocol {
    use super::*;

    /// Initialize a new research request
    pub fn create_request(
        ctx: Context<CreateRequest>,
        topic: String,
        max_sources: u8,
        deadline: i64,
    ) -> Result<()> {
        let request = &mut ctx.accounts.research_request;
        let clock = Clock::get()?;
        
        require!(topic.len() <= 256, ResearchError::TopicTooLong);
        require!(deadline > clock.unix_timestamp, ResearchError::DeadlineInPast);
        
        request.requester = ctx.accounts.requester.key();
        request.topic = topic;
        request.max_sources = max_sources;
        request.deadline = deadline;
        request.status = RequestStatus::Open;
        request.created_at = clock.unix_timestamp;
        request.researcher = None;
        request.methodology_hash = None;
        
        emit!(RequestCreated {
            request: request.key(),
            requester: request.requester,
            topic: request.topic.clone(),
        });
        
        Ok(())
    }

    /// Agent commits to a methodology before researching
    pub fn commit_methodology(
        ctx: Context<CommitMethodology>,
        methodology_hash: [u8; 32],
    ) -> Result<()> {
        let request = &mut ctx.accounts.research_request;
        let clock = Clock::get()?;
        
        require!(request.status == RequestStatus::Open, ResearchError::InvalidStatus);
        require!(clock.unix_timestamp < request.deadline, ResearchError::DeadlinePassed);
        
        request.researcher = Some(ctx.accounts.researcher.key());
        request.methodology_hash = Some(methodology_hash);
        request.status = RequestStatus::InProgress;
        request.methodology_committed_at = Some(clock.unix_timestamp);
        
        emit!(MethodologyCommitted {
            request: request.key(),
            researcher: ctx.accounts.researcher.key(),
            methodology_hash,
        });
        
        Ok(())
    }

    /// Submit the completed research report
    pub fn submit_report(
        ctx: Context<SubmitReport>,
        report_hash: [u8; 32],
        source_hashes: Vec<[u8; 32]>,
        arweave_tx: String,
    ) -> Result<()> {
        let request = &mut ctx.accounts.research_request;
        let report = &mut ctx.accounts.research_report;
        let clock = Clock::get()?;
        
        require!(request.status == RequestStatus::InProgress, ResearchError::InvalidStatus);
        require!(
            request.researcher == Some(ctx.accounts.researcher.key()),
            ResearchError::NotAssignedResearcher
        );
        require!(source_hashes.len() <= 32, ResearchError::TooManySources);
        require!(arweave_tx.len() <= 64, ResearchError::InvalidArweaveTx);
        
        // Store report data
        report.request = request.key();
        report.researcher = ctx.accounts.researcher.key();
        report.report_hash = report_hash;
        report.source_count = source_hashes.len() as u8;
        report.arweave_tx = arweave_tx;
        report.submitted_at = clock.unix_timestamp;
        report.verified = false;
        report.verification_count = 0;
        
        // Copy source hashes
        for (i, hash) in source_hashes.iter().enumerate() {
            report.source_hashes[i] = *hash;
        }
        
        // Update request status
        request.status = RequestStatus::Completed;
        request.completed_at = Some(clock.unix_timestamp);
        
        emit!(ReportSubmitted {
            request: request.key(),
            report: report.key(),
            researcher: report.researcher,
            report_hash,
            source_count: report.source_count,
        });
        
        Ok(())
    }

    /// Verify a research report (by any agent)
    pub fn verify_report(
        ctx: Context<VerifyReport>,
        is_valid: bool,
        notes_hash: Option<[u8; 32]>,
    ) -> Result<()> {
        let report = &mut ctx.accounts.research_report;
        let verification = &mut ctx.accounts.verification;
        let clock = Clock::get()?;
        
        verification.report = report.key();
        verification.verifier = ctx.accounts.verifier.key();
        verification.is_valid = is_valid;
        verification.notes_hash = notes_hash;
        verification.verified_at = clock.unix_timestamp;
        
        report.verification_count += 1;
        if is_valid {
            report.verified = true;
        }
        
        emit!(ReportVerified {
            report: report.key(),
            verifier: verification.verifier,
            is_valid,
        });
        
        Ok(())
    }
}

// Account structures
#[account]
#[derive(Default)]
pub struct ResearchRequest {
    pub requester: Pubkey,
    pub topic: String,
    pub max_sources: u8,
    pub deadline: i64,
    pub status: RequestStatus,
    pub created_at: i64,
    pub researcher: Option<Pubkey>,
    pub methodology_hash: Option<[u8; 32]>,
    pub methodology_committed_at: Option<i64>,
    pub completed_at: Option<i64>,
}

#[account]
pub struct ResearchReport {
    pub request: Pubkey,
    pub researcher: Pubkey,
    pub report_hash: [u8; 32],
    pub source_hashes: [[u8; 32]; 32], // Max 32 sources
    pub source_count: u8,
    pub arweave_tx: String,
    pub submitted_at: i64,
    pub verified: bool,
    pub verification_count: u16,
}

#[account]
pub struct Verification {
    pub report: Pubkey,
    pub verifier: Pubkey,
    pub is_valid: bool,
    pub notes_hash: Option<[u8; 32]>,
    pub verified_at: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Default)]
pub enum RequestStatus {
    #[default]
    Open,
    InProgress,
    Completed,
    Cancelled,
}

// Context structs
#[derive(Accounts)]
#[instruction(topic: String)]
pub struct CreateRequest<'info> {
    #[account(
        init,
        payer = requester,
        space = 8 + 32 + 4 + 256 + 1 + 8 + 1 + 8 + 33 + 33 + 9 + 9,
        seeds = [b"request", requester.key().as_ref(), topic.as_bytes()],
        bump
    )]
    pub research_request: Account<'info, ResearchRequest>,
    #[account(mut)]
    pub requester: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CommitMethodology<'info> {
    #[account(mut)]
    pub research_request: Account<'info, ResearchRequest>,
    pub researcher: Signer<'info>,
}

#[derive(Accounts)]
pub struct SubmitReport<'info> {
    #[account(mut)]
    pub research_request: Account<'info, ResearchRequest>,
    #[account(
        init,
        payer = researcher,
        space = 8 + 32 + 32 + 32 + (32 * 32) + 1 + 4 + 64 + 8 + 1 + 2,
        seeds = [b"report", research_request.key().as_ref()],
        bump
    )]
    pub research_report: Account<'info, ResearchReport>,
    #[account(mut)]
    pub researcher: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VerifyReport<'info> {
    #[account(mut)]
    pub research_report: Account<'info, ResearchReport>,
    #[account(
        init,
        payer = verifier,
        space = 8 + 32 + 32 + 1 + 33 + 8,
        seeds = [b"verification", research_report.key().as_ref(), verifier.key().as_ref()],
        bump
    )]
    pub verification: Account<'info, Verification>,
    #[account(mut)]
    pub verifier: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// Events
#[event]
pub struct RequestCreated {
    pub request: Pubkey,
    pub requester: Pubkey,
    pub topic: String,
}

#[event]
pub struct MethodologyCommitted {
    pub request: Pubkey,
    pub researcher: Pubkey,
    pub methodology_hash: [u8; 32],
}

#[event]
pub struct ReportSubmitted {
    pub request: Pubkey,
    pub report: Pubkey,
    pub researcher: Pubkey,
    pub report_hash: [u8; 32],
    pub source_count: u8,
}

#[event]
pub struct ReportVerified {
    pub report: Pubkey,
    pub verifier: Pubkey,
    pub is_valid: bool,
}

// Errors
#[error_code]
pub enum ResearchError {
    #[msg("Topic exceeds maximum length")]
    TopicTooLong,
    #[msg("Deadline must be in the future")]
    DeadlineInPast,
    #[msg("Invalid request status for this operation")]
    InvalidStatus,
    #[msg("Deadline has passed")]
    DeadlinePassed,
    #[msg("Not the assigned researcher")]
    NotAssignedResearcher,
    #[msg("Too many sources")]
    TooManySources,
    #[msg("Invalid Arweave transaction ID")]
    InvalidArweaveTx,
}
