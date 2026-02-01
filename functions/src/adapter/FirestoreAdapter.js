const {
  Opportunity,
  Source,
  VerificationStatus,
} = require("../domain/entities");
const {
  OpportunityRepository,
  SourceRepository,
} = require("../repository/interfaces");
const { getFirestore } = require("firebase-admin/firestore");

/**
 * Firestore implementation of OpportunityRepository
 */
class FirestoreOpportunityRepository extends OpportunityRepository {
  /**
   * @param {Object} db - Firestore instance
   */
  constructor(db) {
    super();
    this.db = db || getFirestore();
    try {
      this.db.settings({ ignoreUndefinedProperties: true });
    } catch (e) {
      // Ignore if called multiple times or already set
    }
    this.collection = this.db.collection("opportunities");
  }

  /**
   * Save an opportunity
   * @param {Opportunity} opportunity
   * @return {Promise<Opportunity>}
   */
  async save(opportunity) {
    const data = { ...opportunity };
    // Remove undefined fields if any, or handle serialization
    if (!data.id) {
      const ref = this.collection.doc();
      data.id = ref.id;
      await ref.set(data);
      return new Opportunity(data);
    } else {
      await this.collection.doc(data.id).set(data, { merge: true });
      return opportunity;
    }
  }

  /**
   * Get opportunity by ID
   * @param {string} id
   * @return {Promise<Opportunity|null>}
   */
  async getById(id) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return new Opportunity({ id: doc.id, ...doc.data() });
  }

  /**
   * Mark as verified
   * @param {string} id
   * @return {Promise<void>}
   */
  async markAsVerified(id) {
    await this.collection.doc(id).update({
      verified: VerificationStatus.VERIFIED,
      lastVerifiedAt: new Date().toISOString(),
    });
  }

  /**
   * Get verified opportunities with filters
   * @param {Object} filters
   * @return {Promise<Opportunity[]>}
   */
  async getVerifiedOpportunities(filters = {}) {
    let query = this.collection.where(
      "verified",
      "==",
      VerificationStatus.VERIFIED,
    );

    if (filters.state) {
      query = query.where("state", "==", filters.state);
    }
    if (filters.qualification) {
      query = query.where("qualification", "==", filters.qualification);
    }

    // Apply sorting
    // Note: Firestore requires an index for 'verified' + sort fields.
    query = query.orderBy("endDate", "asc");

    const snapshot = await query.get();
    return snapshot.docs.map(
      (doc) => new Opportunity({ id: doc.id, ...doc.data() }),
    );
  }
}

/**
 * Firestore implementation of SourceRepository
 */
class FirestoreSourceRepository extends SourceRepository {
  /**
   * @param {Object} db - Firestore instance
   */
  constructor(db) {
    super();
    this.db = db || getFirestore();
    this.collection = this.db.collection("sources");
  }

  /**
   * Get sources to check
   * @return {Promise<Source[]>}
   */
  async getSourcesToCheck() {
    // Logic: lastCheckedAt < (now - frequency)
    const snapshot = await this.collection.where(
      "status",
      "==",
      "active",
    ).get();
    return snapshot.docs.map(
      (doc) => new Source({ id: doc.id, ...doc.data() }),
    );
  }

  /**
   * Update last check hash
   * @param {string} sourceId
   * @param {string} newHash
   * @return {Promise<void>}
   */
  async updateLastCheck(sourceId, newHash) {
    await this.collection.doc(sourceId).update({
      lastHash: newHash,
      lastCheckedAt: new Date().toISOString(),
    });
  }

  /**
   * Get source by ID
   * @param {string} id
   * @return {Promise<Source|null>}
   */
  async getById(id) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return new Source({ id: doc.id, ...doc.data() });
  }
}

/**
 * Firestore implementation of TrackingRepository
 */
class FirestoreTrackingRepository {
  /**
   * @param {Object} db - Firestore instance
   */
  constructor(db) {
    this.db = db || getFirestore();
    this.collection = this.db.collection("tracking");
  }

  /**
   * Save tracking data
   * @param {Object} trackingData
   * @return {Promise<Object>}
   */
  async save(trackingData) {
    const { userId, opportunityId } = trackingData;
    const id = `${userId}_${opportunityId}`;

    const data = {
      ...trackingData,
      updatedAt: new Date().toISOString(),
      id,
    };

    await this.collection.doc(id).set(data, { merge: true });
    return data;
  }

  /**
   * Get tracking by user ID
   * @param {string} userId
   * @return {Promise<Object[]>}
   */
  async getByUserId(userId) {
    const snapshot = await this.collection.where("userId", "==", userId).get();
    return snapshot.docs.map((doc) => doc.data());
  }
}

module.exports = {
  FirestoreOpportunityRepository,
  FirestoreSourceRepository,
  FirestoreTrackingRepository,
};
