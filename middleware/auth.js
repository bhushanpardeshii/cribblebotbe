// Authentication middleware
const requireAuth = (req, res, next) => {
  if (!req.app.locals.isAuthenticated) {
    return res.status(401).json({
      success: false,
      error: 'Not authenticated. Please login first.'
    });
  }
  next();
};

module.exports = { requireAuth }; 