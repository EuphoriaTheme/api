function isAdmin(req, res, next) {
    if (req.user && req.user.admin === 1) {
      return next();
    }
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }

  module.exports = isAdmin;