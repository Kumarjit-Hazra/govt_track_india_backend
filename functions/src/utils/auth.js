const {getAuth} = require("firebase-admin/auth");
const logger = require("firebase-functions/logger");
const {sendError} = require("./response");

/**
 * Middleware to validate Firebase ID Token
 * Expected header: Authorization: Bearer <token>
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
exports.validateFirebaseIdToken = async (req, res, next) => {
  if (
    !req.headers.authorization ||
        !req.headers.authorization.startsWith("Bearer ")
  ) {
    logger.warn("No Firebase ID token found in request headers.");
    return sendError(res, "Unauthorized: No token provided", 401);
  }

  const idToken = req.headers.authorization.split("Bearer ")[1];

  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    logger.error("Error verifying Firebase ID token:", error);
    return sendError(res, "Unauthorized: Invalid token", 403);
  }
};
