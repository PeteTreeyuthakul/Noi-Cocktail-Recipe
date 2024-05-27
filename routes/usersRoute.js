const {Router} = require('express');
const router = Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserDAO = require('../daos/userDao');
const {isAuthorized,isAdmin} = require('./auth');
const User = require("../models/userModel");
const secretUser ="secretKeyUser"
const secretAdmin ="secretKeyAdmin"
const secretManager ="secretKeyManager"

router.post('/signup', async (req, res, next) => {
  const email= req.body.email;
  const password  = req.body.password;
  try {
    const existingUser = await UserDAO.getUser(email);
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }else{
    
      if(!password){
        return res.status(400).json({ message: 'Empty password' })
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await UserDAO.createUser({ email, password: hashedPassword });
      res.status(200).json({ message: 'User created successfully' });
    }

  } catch (error) {
    next(error)
  }
});

router.post('/login', async (req, res, next) => {
  const email = req.body.email;
  const password  = req.body.password;
  let secretKey =""

  try {
    const user = await UserDAO.getUser(email);

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if(!password){
      return res.status(400).json({ message: 'Empty password' });
    }
      
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });

    } 
    if(user.roles.includes('admin')){
        secretKey = secretAdmin
    }else if(user.roles.includes('manager')){
        secretKey = secretManager
    }else{
        secretKey = secretUser
    }
    const token = jwt.sign({
      _id: user._id,
      email: user.email,
      roles: user.roles
    },secretKey);

    res.status(200).json({token});

  } catch (error) {
    next(error)
  }
});
  
router.put('/password', isAuthorized, async (req, res, next) => {
  try {
    const newPassword  = req.body.password;
    const user = req.user;

    if (!newPassword) {
      return res.status(400).json({ error: 'Empty password' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await UserDAO.updateUserPassword(user._id, hashedNewPassword);
    res.status(200).json({ message: 'Password updated successfully'},);

  } catch (error) {
    next(error)
  }
});

router.post('/:userId/roles',isAuthorized,isAdmin, async (req, res) => {
  try {
      const { userId } = req.params;
      const { roles } = req.body;
      const user = await User.findById(userId);

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      if (!roles=='manager'&&!roles=='admin') {
        return res.status(404).json({ error: 'Wrong input for roles' });
      }

      if (user.roles.includes(roles)) {
        return res.status(409).json({ error: `${roles} already assign to user` });
      }

      user.roles.push(roles);
      await user.save();

      res.status(200).json({ message: 'Roles added successfully', user });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
});


router.post('/logout', async (req, res, next) => {
  return res.sendStatus(404)
});

module.exports = router;