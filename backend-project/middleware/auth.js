export const isAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.adminId) {
    return res.status(401).json({
      success: false,
      message: 'Please login first',
    });
  }
  next();
};

export const isNotAuthenticated = (req, res, next) => {
  if (req.session && req.session.adminId) {
    return res.status(400).json({
      success: false,
      message: 'Already logged in',
    });
  }
  next();
};
