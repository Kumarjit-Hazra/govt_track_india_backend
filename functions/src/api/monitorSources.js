const {onSchedule} = require("firebase-functions/v2/scheduler");
const logger = require("firebase-functions/logger");
const {FirestoreSourceRepository} = require("../adapter/FirestoreAdapter");
// In a real scenario, use 'node-fetch' or 'axios' to fetch URL content.
// Since node environment is recent, 'fetch' might be available globally.
// If not, we'd need to add it to package.json.
// For now, I will use a simple placeholder fetch logic.

/**
 * Scheduled function to monitor sources.
 * Runs every 30 minutes (customizable via schedule).
 */
exports.monitorSources = onSchedule({
  schedule: "every 30 minutes",
  region: "asia-south1",
}, async (event) => {
  const repo = new FirestoreSourceRepository();
  const sources = await repo.getSourcesToCheck();

  logger.info(`Found ${sources.length} sources to check.`);

  for (const source of sources) {
    try {
      logger.info(`Checking source: ${source.name} (${source.url})`);

      const response = await fetch(source.url);
      if (!response.ok) {
        logger.error(`Failed to fetch ${source.url}: ${response.statusText}`);
        continue;
      }
      const text = await response.text();

      // Normalize: basic whitespace normalization for now
      const normalizedContent = text.replace(/\s+/g, " ").trim();

      const crypto = require("crypto");
      const hash = crypto.createHash("sha256")
          .update(normalizedContent)
          .digest("hex");

      if (source.lastHash !== hash) {
        logger.info(`Change detected for ${source.name}!`);
        logger.info(`New Hash: ${hash}, Old Hash: ${source.lastHash}`);

        // Requirement: log but never auto-publish
        // We update the hash so we don't spam logs on next run,
        // effectively acknowledging we saw this version.
        await repo.updateLastCheck(source.id, hash);
      } else {
        logger.info(`No change for ${source.name}.`);
        // Still update lastCheckedAt
        await repo.updateLastCheck(source.id, source.lastHash);
      }
    } catch (error) {
      logger.error(`Failed to check source ${source.name}:`, error);
    }
  }
});
