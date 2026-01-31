const {onRequest} = require("firebase-functions/v2/https");
const {onDocumentWritten} = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const {FirestoreOpportunityRepository} = require("../adapter/FirestoreAdapter");
const VerificationService = require("../domain/VerificationService");
const {Opportunity, VerificationStatus} = require("../domain/entities");
const {sendNotifications} = require("./notifications");

// Initialize dependencies
const opportunityRepo = new FirestoreOpportunityRepository();
const verificationService = new VerificationService(opportunityRepo);

// Admin-only HTTP PROVISIONAL implementation
// Real auth should verify ID token claims for 'admin' role.
exports.createOrUpdateOpportunity = onRequest(
    {region: "asia-south1"},
    async (request, response) => {
    // 1. Auth Check (Basic Placeholder)
    // const token = request.headers.authorization;
    // if (!isValidAdmin(token)) return response.status(403).send("Unauth");

      try {
        const data = request.body;

        // 2. Validate Input
        if (!data.title || !data.officialUrl) {
          return response.status(400).json({
            error: "Missing required fields: title, officialUrl",
          });
        }

        // 3. Create Domain Entity
        const opportunity = new Opportunity({
          ...data,
          // Ensure we don't blindly trust 'verified' from client
          // For safety, explicitly set to UNVERIFIED for new creations.
          verified: VerificationStatus.UNVERIFIED,
        });

        // 4. Save
        const saved = await opportunityRepo.save(opportunity);

        response.json({message: "Opportunity saved", id: saved.id});
      } catch (error) {
        logger.error("Error saving opportunity:", error);
        response.status(500).json({error: "Internal Server Error"});
      }
    },
);

// Internal trigger to handle publishing/notification logic
// Triggered on Firestore Write
exports.publishVerifiedOpportunity = onDocumentWritten(
    "opportunities/{docId}",
    async (event) => {
      const snapshot = event.data;
      if (!snapshot) return; // Deletion

      const afterData = snapshot.after.data();
      const beforeData = snapshot.before.data();

      // If newly verified
      if (
        afterData &&
      afterData.verified === VerificationStatus.VERIFIED &&
      (!beforeData || beforeData.verified !== VerificationStatus.VERIFIED)
      ) {
        const opportunity = new Opportunity({
          id: snapshot.after.id,
          ...afterData,
        });
        const shouldPublish = await verificationService.publishOpportunity(
            opportunity.id,
        );

        if (shouldPublish) {
          logger.info(
              `Opportunity ${opportunity.id} is verified and ready.`,
          );
          await sendNotifications(opportunity);
        }
      }
    },
);
