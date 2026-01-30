const { Opportunity, Source, VerificationStatus } = require('../domain/entities');
const { OpportunityRepository, SourceRepository } = require('../repository/interfaces');
const { getFirestore } = require('firebase-admin/firestore');

class FirestoreOpportunityRepository extends OpportunityRepository {
    constructor(db) {
        super();
        this.db = db || getFirestore();
        this.collection = this.db.collection('opportunities');
    }

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

    async getById(id) {
        const doc = await this.collection.doc(id).get();
        if (!doc.exists) return null;
        return new Opportunity({ id: doc.id, ...doc.data() });
    }

    async markAsVerified(id) {
        await this.collection.doc(id).update({
            verified: VerificationStatus.VERIFIED,
            lastVerifiedAt: new Date().toISOString()
        });
    }
}

class FirestoreSourceRepository extends SourceRepository {
    constructor(db) {
        super();
        this.db = db || getFirestore();
        this.collection = this.db.collection('sources');
    }

    async getSourcesToCheck() {
        // Logic: lastCheckedAt < (now - frequency)
        // For simplicity, we might just fetch all 'active' sources and filter in code
        // or use a complex query.
        // Let's assume we check everything for now to be safe, or query by 'status' == 'active'
        const snapshot = await this.collection.where('status', '==', 'active').get();
        return snapshot.docs.map(doc => new Source({ id: doc.id, ...doc.data() }));
    }

    async updateLastCheck(sourceId, newHash) {
        await this.collection.doc(sourceId).update({
            lastHash: newHash,
            lastCheckedAt: new Date().toISOString()
        });
    }
}

module.exports = {
    FirestoreOpportunityRepository,
    FirestoreSourceRepository
};
