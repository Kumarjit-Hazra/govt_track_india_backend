const { VerificationStatus } = require('./entities');

class VerificationService {
    constructor(opportunityRepository) {
        this.opportunityRepository = opportunityRepository;
    }

    /**
     * Publishes an opportunity only if it is verified.
     * Based on the rule: "no notifications without verification" and "visibility_rule".
     *
     * @param {string} opportunityId
     * @returns {Promise<boolean>} true if published, false if not eligible
     */
    async publishOpportunity(opportunityId) {
        const opportunity = await this.opportunityRepository.getById(opportunityId);

        if (!opportunity) {
            throw new Error(`Opportunity with ID ${opportunityId} not found.`);
        }

        if (!opportunity.isVerified()) {
            console.warn(`Attempted to publish unverified opportunity: ${opportunityId}`);
            return false;
        }

        // Logic to actually "publish" could involve setting a flag or triggering a notification.
        // For now, we assume if it's verified, it's effectively "publishable".
        // We might want to explicit set a 'published' flag if the domain requires it separate from 'verified'.
        // Given the prompt: "only verified opportunities are visible", verification IS the gate.

        // Return true indicating it is safe to proceed with notifications/visibility
        return true;
    }

    /**
     * Verifies a source's hash to see if content changed.
     * @param {Source} source
     * @param {string} newHash
     * @returns {boolean}
     */
    hasContentChanged(source, newHash) {
        return source.lastHash !== newHash;
    }
}

module.exports = VerificationService;
