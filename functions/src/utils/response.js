/**
 * Standardized success response
 * @param {Object} res - Express response object
 * @param {Object} data - payload
 */
exports.sendSuccess = (res, data = {}) => {
  res.json({
    success: true,
    data,
  });
};

/**
 * Standardized error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} code - HTTP status code
 */
exports.sendError = (res, message, code = 500) => {
  // In production, we might want to log the stack trace here
  // but not send it to client
  res.status(code).json({
    success: false,
    error: message,
  });
};
