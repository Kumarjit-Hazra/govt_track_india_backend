/**
 * Domain Entities for GovTrack India
 *
 * These classes represent the core business objects.
 * They should remain independent of the database (Firestore) or API layers.
 */

// Value Object for verification status
const VerificationStatus = {
  UNVERIFIED: 'unverified',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
};

class Source {
  constructor({
    id,
    name,
    url,
    checkFrequencyMinutes = 60,
    lastHash = null,
    lastCheckedAt = null,
    status = 'active',
  }) {
    this.id = id;
    this.name = name;
    this.url = url;
    this.checkFrequencyMinutes = checkFrequencyMinutes;
    this.lastHash = lastHash;
    this.lastCheckedAt = lastCheckedAt;
    this.status = status;
  }
}

class Opportunity {
  constructor({
    id,
    title,
    state, // e.g., 'WB', 'Delhi', 'All India'
    qualification, // e.g., '10th', '12th', 'Graduate'
    startDate,
    endDate,
    officialUrl,
    sourceId,
    verified = VerificationStatus.UNVERIFIED,
    lastVerifiedAt = null,
  }) {
    this.id = id;
    this.title = title;
    this.state = state;
    this.qualification = qualification;
    this.startDate = startDate;
    this.endDate = endDate;
    this.officialUrl = officialUrl;
    this.sourceId = sourceId;
    this.verified = verified;
    this.lastVerifiedAt = lastVerifiedAt;
  }

  isVerified() {
    return this.verified === VerificationStatus.VERIFIED;
  }
}

module.exports = {
  VerificationStatus,
  Source,
  Opportunity,
};
