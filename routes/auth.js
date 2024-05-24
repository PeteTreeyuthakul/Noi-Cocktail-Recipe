const jwt = require('jsonwebtoken')
const User = require("../models/userModel");

const isAuthorized = async (req, res, next) => {
  
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      //console.log(authHeader)
      const token = authHeader.replace('Bearer ','')
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }
      //console.log(`The token is ${token}`)
  
      const decodedToken = jwt.decode(token);
      //console.log(`The user is ${decodedToken}`)
      if (!decodedToken) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
  
      //req.user = decodedToken;
      //console.log(`Id is ${decodedToken.roles}`)
/*
      const user = await User.findOne({ email: decodedToken.email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      console.log(`user is ${user}`)
      if (!user.roles.includes('admin')) {
        user.roles.push('admin');
        await user.save();
        console.log(user)
      }
*/
      req.user = decodedToken;
      console.log('Auth checked')
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

const isManager = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = req.user;

    if (!user.roles.includes('manager')) {
        return res.status(403).json({ error: 'Forbidden, manager access required' });
    }

    next();
};

function isAdminOrManager(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
}
const user = req.user;
  if (user.roles.includes('admin') || user.roles.includes('manager')) {
    console.log(`admin & manager checked`)
    return next();
  } else {
    return res.status(403).json({ message: 'Forbidden: Requires Admin or Manager role' });
  }
}

module.exports = {isAuthorized,isAdmin,isManager,isAdminOrManager};