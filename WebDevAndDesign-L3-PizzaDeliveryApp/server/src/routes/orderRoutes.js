const express = require('express');
const {protect, adminOnly} = require('../middleware/authMiddleware');
const {createOrder, getMyOrders, getAllOrders, updateOrderStatus} = require('../controllers/orderController');

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/', protect, adminOnly, getAllOrders);
router.patch('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;