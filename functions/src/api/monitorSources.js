const { onSchedule } = require("firebase-functions/v2/scheduler");
const logger = require("firebase-functions/logger");
const { FirestoreSourceRepository } = require("../adapter/FirestoreAdapter");
// In a real scenario, use 'node-fetch' or 'axios' to fetch URL content.
// Since node environment is recent, 'fetch' might be available globally.
// If not, we'd need to add it to package.json.
// For now, I will use a simple placeholder fetch logic or assume global fetch (Node 18+).

/**
 * Scheduled function to monitor sources.
 * Runs every 30 minutes (customizable via schedule).
 */
exports.monitorSources = onSchedule({
    schedule: "every 30 minutes",
    region: "asia-south1"
}, async (event) => {
    const repo = new FirestoreSourceRepository();
    const sources = await repo.getSourcesToCheck();

    logger.info(`Found ${sources.length} sources to check.`);

    for (const source of sources) {
        try {
            logger.info(`Checking source: ${source.name} (${source.url})`);

            // Mock fetching content for now.
            // const response = await fetch(source.url);
            // const text = await response.text();
            const text = `mock content for ${source.url} at ${new Date().toISOString()}`;

            // Simple hash (using crypto module if available, or a simple string hash for demo)
            // Node.js crypto is standard.
            const crypto = require('crypto');
            const hash = crypto.createHash('sha256').update(text).digest('hex');

            if (source.lastHash !== hash) {
                logger.info(`Change detected for ${source.name}!`);
                // Here we would trigger an "Opportunity Draft" creation or notify admin
                await repo.updateLastCheck(source.id, hash);
            } else {
                logger.info(`No change for ${source.name}.`);
            }
        } catch (error) {
            logger.error(`Failed to check source ${source.name}:`, error);
        }
    }
});
