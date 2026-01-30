/**
 * Import function triggers from their respective submodules
 */

const { initializeApp } = require("firebase-admin/app");
const { setGlobalOptions } = require("firebase-functions/v2");

initializeApp();

// Set global options, e.g., region
setGlobalOptions({ region: "asia-south1", maxInstances: 10 });

// Export API functions
const { healthCheck } = require("./src/api/healthCheck");
const { monitorSources } = require("./src/api/monitorSources");
const { createOrUpdateOpportunity, publishVerifiedOpportunity } = require("./src/api/opportunities");

// Export to Firebase
exports.healthCheck = healthCheck;
exports.monitorSources = monitorSources;
exports.createOrUpdateOpportunity = createOrUpdateOpportunity;
exports.publishVerifiedOpportunity = publishVerifiedOpportunity;
