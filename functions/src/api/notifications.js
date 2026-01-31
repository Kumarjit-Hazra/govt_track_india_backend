const logger = require("firebase-functions/logger");
// In a real app, import 'firebase-admin/messaging'
// const { getMessaging } = require('firebase-admin/messaging');

/**
 * Send verified notifications to eligible users.
 * This helper would be called by publishVerifiedOpportunity.
 *
 * @param {Object} opportunity
 * @return {Promise<boolean>}
 */
async function sendNotifications(opportunity) {
  logger.info(`Preparing to send notifications for: ${opportunity.title}`);

  // Logic:
  // 1. Query users who match criteria (state, qualification).
  // 2. Check notification throttling (max 2 per day).
  // 3. Send via FCM.

  // For MVP/Demo:
  logger.info(
      `[MOCK] Sending FCM: "Job in ${opportunity.state}: ${opportunity.title}"`,
  );

  return true;
}

module.exports = {
  sendNotifications,
};
