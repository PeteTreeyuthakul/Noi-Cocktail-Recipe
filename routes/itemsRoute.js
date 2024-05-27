const {Router} = require('express');
const router = Router();
const itemDao = require('../daos/itemDao');
const {isAuthorized,isAdminOrManager,isAdmin} = require('./auth');

router.post('/', isAuthorized, isAdminOrManager, async (req, res, next) => {
  try {
    const itemAdd = req.body
    const newItem = await itemDao.createItem(itemAdd);
    res.status(200).json(newItem);

  } catch (error) {
    next(error)
  }
});

router.put('/:id', isAuthorized, isAdminOrManager, async (req, res, next) => {
  try {
    const itemId = req.params.id;
    const updatedItem = await itemDao.updateItemById(itemId, req.body);

    if (!updatedItem) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(updatedItem);

  } catch (error) {
    next(error)
  }
});

router.get("/search",isAuthorized, async (req, res, next) => {
  try{
    let {query} = req.query;
    const items = await itemDao.search(query);
    res.json(items);

  }catch(e) {
    next(error)
  }
});

router.get('/',isAuthorized, async (req, res, next) => {
  try {
    const items = await itemDao.findAllItems();
    res.json(items);

  } catch (error) {
    next(error)
  }
});

router.get('/:id',isAuthorized, async (req, res, next) => {
  try {
    const itemId = req.params.id;
    if (!itemId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({message: "ID is not a valid MongoDB _id, Please Check ID"})
    }
    const item = await itemDao.findItemById(itemId);
    res.json(item);
    
  } catch (error) {
    next(error)
  }
});

router.delete("/:id",isAuthorized,isAdmin, async (req, res, next) => {
  try {
    const itemId = req.params.id;
    if (!itemId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({message: "ID is not a valid MongoDB _id, Please Check ID"})
    }
    const item = await itemDao.findItemById(itemId);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    await itemDao.removeById(itemId);
    res.sendStatus(200);
  } catch(error) {
    next(error);
  }
});

module.exports = router;