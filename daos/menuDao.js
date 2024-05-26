const Menu = require('../models/menuModel');
module.exports = {};

module.exports.createMenu= async(userId, itemIds, number)=>{
  try {
    const menu = await Menu.create({ userId, list: itemIds, number });
    return menu;

  } catch (error) {
    throw new Error(`Error creating order: ${error.message}`);
  }
}

module.exports.findAllMenu= async () => {
  try {
    const menus = await Menu.find({})
    .populate('list',
      { _id:0,
        __v:0,
        ingredients:0,
        techniques:0,
        garnish:0
      }
    )
    .populate('userId',
      { _id:0,
        __v:0,
        password:0,
        roles:0
      }
    ).select('number');
    return menus;

  } catch (error) {
    throw new Error('Error finding all Menu');
  }
},

module.exports.findMenuById= async (menuId) => {
  try {
    const menu = await Menu.findById(menuId)
    .populate('list',
      { _id:0,
        __v:0,
        ingredients:0,
        techniques:0,
        garnish:0
      }
    )
    .populate('userId',
      { _id:0,
        __v:0,
        password:0,
        roles:0
      }
    ).select('number');
    return menu;

  } catch (error) {
    throw new Error('Error finding Menu by ID');
  }
}

module.exports.findUserMenu= async(userId)=> {
  try {
    const menus = await Menu.find( {userId})
    .populate('list',
      { _id:0,
        __v:0,
        ingredients:0,
        techniques:0,
        garnish:0
      }
    )
    .populate('userId',
      { _id:0,
        __v:0,
        password:0,
        roles:0
      }
    ).select('number');
    return menus;
    
  } catch (error) {
    throw new Error('Error finding user Menu');
  }
}

