const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const {
  FirestoreOpportunityRepository,
  FirestoreTrackingRepository,
} = require("../adapter/FirestoreAdapter");
const {validateFirebaseIdToken} = require("../utils/auth");
const {sendSuccess, sendError} = require("../utils/response");

const opportunityRepo = new FirestoreOpportunityRepository();
const trackingRepo = new FirestoreTrackingRepository();

// GET /opportunities
// Publicly accessible, but focused on verified items only
exports.getOpportunities = onRequest(
    {region: "asia-south1"},
    async (req, res) => {
      try {
        const {state, qualification} = req.query;
        const filters = {state, qualification};

        const opportunities = await opportunityRepo.getVerifiedOpportunities(
            filters,
        );

        sendSuccess(res, {opportunities});
      } catch (error) {
        logger.error("Error fetching opportunities:", error);
        sendError(res, "Failed to fetch opportunities", 500);
      }
    },
);

// POST /tracking
// Authenticated user updates their tracking status for an opportunity
exports.updateTracking = onRequest(
    {region: "asia-south1"},
    async (req, res) => {
    // 1. Auth Middleware
      await validateFirebaseIdToken(req, res, async () => {
        try {
          const {uid} = req.user;
          const {opportunityId, status} = req.body;

          // 2. Input Validation
          const allowedStatuses = ["applied", "admit_card", "exam_done"];
          if (!opportunityId || !status || !allowedStatuses.includes(status)) {
            return sendError(
                res,
                "Invalid input. Status must be one of: " +
            allowedStatuses.join(", "),
                400,
            );
          }

          // 3. Save
          const trackingData = {
            userId: uid,
            opportunityId,
            status,
          };

          const saved = await trackingRepo.save(trackingData);
          sendSuccess(res, {tracking: saved});
        } catch (error) {
          logger.error("Error updating tracking:", error);
          sendError(res, "Failed to update tracking", 500);
        }
      });
    },
);

// GET /tracking
// Authenticated user gets their tracked applications
exports.getTracking = onRequest({region: "asia-south1"}, async (req, res) => {
  await validateFirebaseIdToken(req, res, async () => {
    try {
      const {uid} = req.user;
      const trackingList = await trackingRepo.getByUserId(uid);

      sendSuccess(res, {tracking: trackingList});
    } catch (error) {
      logger.error("Error fetching tracking:", error);
      sendError(res, "Failed to fetch tracking", 500);
    }
  });
});
