const {Router} = require('express');
const router = Router();
const menuDao = require('../daos/menuDao');
const itemDao = require('../daos/itemDao');
const {isAuthorized,isAdminOrManager} = require('./auth');

router.post('/', isAuthorized,isAdminOrManager, async (req, res, next) => {
  try {
    const itemsIdArr = req.body
    let number = 0
    for (const itemId of itemsIdArr) {
      const item = await itemDao.findItemById(itemId);
      if (!item) {
        return res.status(400).json({ error: `Item with ID ${itemId} not found` });
      }else{
        number += 1;
      }
    }
    const newMenu = await menuDao.createMenu(req.user,itemsIdArr,number);
    res.status(200).json(newMenu);

  } catch (error) {
    next(error)
  }
});

router.get('/', isAuthorized,isAdminOrManager, async (req, res, next) => {
  try {
    let menu;
    if (req.user.roles.includes('admin')) {
      menu = await menuDao.findAllMenu();
    } else {
      menu = await menuDao.findUserMenu(req.user._id);
    }    
    res.json(menu);

  } catch (error) {
    next(error)
  }
});

router.get('/:id', isAuthorized,isAdminOrManager, async (req, res, next) => {
  try {
    const menuId = req.params.id;
    const menu = await menuDao.findMenuById(menuId);
    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' });
    }
    if(req.user.roles.includes('admin')){
      return res.json(menu);
    }else{
      if(menu.userId.email.toString() !== req.user.email.toString()){
        return res.status(404).json({ error: 'Wrong User' });
      }
      return res.json(menu);
    }

  } catch (error) {
    next(error)
  }
});

module.exports = router;
