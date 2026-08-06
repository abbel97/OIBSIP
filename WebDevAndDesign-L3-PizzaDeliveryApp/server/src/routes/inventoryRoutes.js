const express = require('express');
const {protect, adminOnly} = require('../middleware/authMiddleware');
const { getInventory, getInventoryOptions, updateStock } = require('../controllers/inventoryController');

const router = express.Router();

router.get('/', protect, adminOnly, getInventory);
router.get('/options', protect, getInventoryOptions);
router.patch('/:id', protect, adminOnly, updateStock);

module.exports = router;