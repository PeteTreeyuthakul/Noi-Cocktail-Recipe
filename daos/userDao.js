const User = require('../models/userModel');
module.exports = {};

module.exports.createUser = async (userObj) => {
  try {
    const { email, password } = userObj;
    await User.create({ email, password });

  } catch (error) {
    throw new Error('Failed to create user');
  }
};

module.exports.getUser= async (email)=> {
  try {
    const user = await User.findOne({ email }); 
    return user;

  } catch (error) {
    throw new Error('Failed to get user');
  }
},

module.exports.updateUserPassword= async (userId, password)=> {
  try {
    const user = await User.findByIdAndUpdate(userId, { password }, { new: true });
    return user;

  } catch (error) {
    throw new Error('Failed to update user password');
  }
}



