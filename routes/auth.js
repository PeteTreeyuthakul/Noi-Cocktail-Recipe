const jwt = require('jsonwebtoken')

const isAuthorized = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.replace('Bearer ','')
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decodedToken = jwt.decode(token);
    if (!decodedToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = decodedToken;
    next();

  } catch (error) {
    res.status(403).json({ error: 'Token verification failed' });
  }
};
  
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const user = req.user;
  if (!user.roles.includes('admin')) {
    return res.status(403).json({ error: 'Forbidden, admin access required' });
  }
  next();
};

function isAdminOrManager(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const user = req.user;
  if (user.roles.includes('admin') || user.roles.includes('manager')) {
    return next();
  } else {
    return res.status(403).json({ message: 'Forbidden: Requires Admin or Manager role' });
  }
}

module.exports = {isAuthorized,isAdmin,isAdminOrManager};