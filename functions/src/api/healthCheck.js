const {onRequest} = require("firebase-functions/v2/https");

// Simple health check to verify backend is reachable
exports.healthCheck = onRequest(
    {region: "asia-south1"},
    (request, response) => {
      response.json({
        status: "alive",
        timestamp: new Date().toISOString(),
        region: process.env.FUNCTION_REGION || "unknown",
      });
    },
);
