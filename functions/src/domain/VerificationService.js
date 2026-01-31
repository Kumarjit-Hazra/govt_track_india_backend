// VerificationStatus import removed as it was unused

/**
 * Service to handle verification logic
 */
class VerificationService {
  /**
   * @param {OpportunityRepository} opportunityRepository
   */
  constructor(opportunityRepository) {
    this.opportunityRepository = opportunityRepository;
  }

  /**
   * Determine if an opportunity should be published
   * @param {string} opportunityId - ID to check
   * @return {Promise<boolean>} - True if published
   */
  async publishOpportunity(opportunityId) {
    const opportunity = await this.opportunityRepository.getById(opportunityId);

    if (!opportunity) {
      throw new Error(`Opportunity with ID ${opportunityId} not found.`);
    }

    if (!opportunity.isVerified()) {
      console.warn(`Attempt to publish unverified opp: ${opportunityId}`);
      return false;
    }

    // Logic to actually "publish" could involve setting a flag
    // or triggering a notification.
    // For now, we assume if it's verified, it's effectively "publishable".
    // Given the prompt: "only verified opportunities are visible",
    // verification IS the gate.

    // Return true indicating it is safe to proceed
    return true;
  }

  /**
   * Verifies a source's hash to see if content changed.
   * @param {Source} source
   * @param {string} newHash
   * @return {boolean}
   */
  hasContentChanged(source, newHash) {
    return source.lastHash !== newHash;
  }
}

module.exports = VerificationService;
