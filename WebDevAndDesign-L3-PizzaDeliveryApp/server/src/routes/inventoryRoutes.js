const express = require('express');
const {protect, adminOnly} = require('../middleware/authMiddleware');
const { getInventory, getInventoryOptions, updateStock, triggerLowStockCheck } = require('../controllers/inventoryController');

const router = express.Router();

router.get('/', protect, adminOnly, getInventory);
router.get('/options', protect, getInventoryOptions);
router.patch('/:id', protect, adminOnly, updateStock);
router.post('/check-low-stock', protect, adminOnly, triggerLowStockCheck);

module.exports = router;