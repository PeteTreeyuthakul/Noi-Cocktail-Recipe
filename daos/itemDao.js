const Item = require('../models/itemModel');
module.exports = {};

module.exports.createItem= async (itemData) => {
  try {
    const newItem = await Item.create(itemData);
    return newItem;
  } catch (error) {
    throw new Error('Error creating item');
  }
},

module.exports.search = async (query) =>{
  try{
    return Item.find(
      {$text: { $search: query}},
      {score:{$meta:'textScore'},score:0})
      .sort({ score: { $meta: "textScore" } })
    
  }catch (e) {
    throw e;
  } 
}

module.exports.findAllItems= async () => {
  try {
    const items = await Item.find();
    return items;
  } catch (error) {
    throw new Error('Error finding all items');
  }
},

module.exports.findItemById= async (itemId) => {
  try {
    const item = await Item.findById(itemId);
    return item;
  } catch (error) {
    throw new Error('Error finding item by ID');
  }
},

module.exports.updateItemById= async (itemId, newData) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(itemId, newData, { new: true });
    return updatedItem;
  } catch (error) {
    throw new Error('Error updating item by ID');
  }
}
