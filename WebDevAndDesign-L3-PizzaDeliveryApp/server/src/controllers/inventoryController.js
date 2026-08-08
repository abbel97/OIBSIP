const Inventory = require('../models/Inventory');
const checkLowStock = require('../jobs/lowStockCheck');

const getInventory = async(req, res) => {
    try{
        const items = await Inventory.find().sort({itemType: 1, name: 1});
        res.json(items);
    }
    catch(err){
        res.status(500).json({message:"Server error", error: err.message});
    }
};

const getInventoryOptions = async(req, res) => {
    try{
        const items = await Inventory.find({stock:{ $gt:0 }})
          .select('name itemType unitPrice').sort({itemType: 1, name: 1});
        res.json(items);
    }
    catch(err){
        res.staus(500).json({message: 'Server Error', error: err.message});
    }
}

const updateStock = async(req, res) => {
    try{
        const{stock, lowStockThreshold, unitPrice} = req.body;

        const item = await Inventory.findById(req.params.id);
        if(!item){
            return res.status(404).json({message: 'Inventory item not found'});
        }

        if(stock !== undefined){
            if(stock < 0){
                return res.status(400).json({message: 'Stock cannot be negative'});
            }      
            item.stock = stock;   
        }
        
    if (lowStockThreshold != undefined) item.lowStockThreshold = lowStockThreshold;
    if (unitPrice != undefined) item.unitPrice = unitPrice;

    if(item.stock > item.lowStockThreshold){
        item.lowStockNotified = false;
    }

    await item.save();
    res.json(item);
  }
  catch(err){
    res.status(500).json({message: 'Server error', error: err.message});
  }
};

const triggerLowStockCheck = async (req, res) => {
  try {
    const result = await checkLowStock();
    res.json(result);
  } 
  catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {getInventory, getInventoryOptions, updateStock, triggerLowStockCheck}