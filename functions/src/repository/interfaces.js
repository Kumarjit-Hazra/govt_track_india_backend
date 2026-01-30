/**
 * Repository Interfaces
 *
 * In a typed language (TS), these would be interfaces.
 * In JS, we document the expected methods to ensure consistent implementation across adapters.
 */

class SourceRepository {
  /**
   * Fetch all active sources requiring a check.
   * @returns {Promise<Source[]>}
   */
  async getSourcesToCheck() {
    throw new Error('Method not implemented');
  }

  /**
   * Update the hash and last checked time for a source.
   * @param {string} sourceId
   * @param {string} newHash
   */
  async updateLastCheck(sourceId, newHash) {
    throw new Error('Method not implemented');
  }
}

class OpportunityRepository {
  /**
   * Create or update an opportunity.
   * @param {Opportunity} opportunity
   */
  async save(opportunity) {
    throw new Error('Method not implemented');
  }

  /**
   * Get an opportunity by ID.
   * @param {string} id
   * @returns {Promise<Opportunity|null>}
   */
  async getById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * Mark an opportunity as verified.
   * @param {string} id
   */
  async markAsVerified(id) {
    throw new Error('Method not implemented');
  }
}

module.exports = {
  SourceRepository,
  OpportunityRepository,
};
