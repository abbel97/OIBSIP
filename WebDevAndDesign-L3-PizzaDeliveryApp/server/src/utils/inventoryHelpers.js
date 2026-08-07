const Inventory = require('../models/Inventory');

const decrementInventory = async (itemsWithQty) => {
  const decremented = [];

  for (const { id, quantity } of itemsWithQty) {
    const updated = await Inventory.findOneAndUpdate(
      { _id: id, stock: { $gte: quantity }},
      { $inc: {stock: -quantity }},
      { new: true }
    );

    if (!updated) {
      await rollbackInventory(decremented);
      const failedItem = await Inventory.findById(id);
      throw new Error(`Insufficient stock for ${failedItem ? failedItem.name : 'an ingredient'}`);
    }

    decremented.push({ id, quantity });
  }

  return decremented;
};

const rollbackInventory = async (decremented) => {
  for (const { id, quantity } of decremented) {
    await Inventory.findByIdAndUpdate(id, { $inc: { stock: quantity } });
  }
};

module.exports = { decrementInventory, rollbackInventory };