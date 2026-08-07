//is there any issue with this code??


const Order = require('../models/Order');
const MenuPizza = require('../models/MenuPizza');
const Inventory = require('../models/Inventory');
const {decrementInventory} = require('../utils/inventoryHelpers');

const VALID_STATUSES = ['received', 'in_kitchen', 'sent_to_delivery'];

const buildItemsList = (base, sauce, cheese, veggies, quantity) => [
  {id: base, quantity},
  {id: sauce, quantity},
  {id: cheese, quantity},
  ...veggies.map((v) => ({id: v, quantity})),
];

const createOrder = async (req, res) => {
  try {
    const { orderType, menuPizzaId, customBuild, quantity = 1 } = req.body;

    if (!['predefined', 'custom'].includes(orderType)) {
      return res.status(400).json({message: 'orderType must be predefined or custom' });
    }
    if (quantity < 1) {
      return res.status(400).json({message: 'Quantity must be at least 1' });
    }

    let itemName, itemPrice, base, sauce, cheese, veggies, orderCustomBuild, orderMenuPizza;

    if (orderType === 'predefined') {
      if (!menuPizzaId) {
        return res.status(400).json({message: 'menuPizzaId is required for predefined orders' });
      }

      const menuPizza = await MenuPizza.findById(menuPizzaId);
      if (!menuPizza || !menuPizza.isActive) {
        return res.status(404).json({message: 'Menu pizza not found or unavailable' });
      }

      itemName = menuPizza.name;
      itemPrice = menuPizza.price; // trusted — comes from DB, never the client
      base = menuPizza.recipe.base;
      sauce = menuPizza.recipe.sauce;
      cheese = menuPizza.recipe.cheese;
      veggies = menuPizza.recipe.veggies;
      orderMenuPizza = menuPizza._id;
    } 
    else {
      if (!customBuild || !customBuild.base || !customBuild.sauce || !customBuild.cheese) {
        return res.status(400).json({message: 'base, sauce, and cheese are required for custom orders' });
      }

      const veggieIds = customBuild.veggies || [];

      const [baseItem, sauceItem, cheeseItem, veggieItems] = await Promise.all([
        Inventory.findOne({ _id: customBuild.base, itemType: 'base' }),
        Inventory.findOne({ _id: customBuild.sauce, itemType: 'sauce' }),
        Inventory.findOne({ _id: customBuild.cheese, itemType: 'cheese' }),
        Inventory.find({ _id: { $in: veggieIds }, itemType: 'veggie' }),
      ]);

      if (!baseItem || !sauceItem || !cheeseItem){
        return res.status(400).json({message: 'One or more selected ingredients are invalid' });
      }
      if (veggieItems.length !== veggieIds.length) {
        return res.status(400).json({message: 'One or more selected veggies are invalid' });
      }

      const veggieTotal = veggieItems.reduce((sum, v) => sum + v.unitPrice, 0);
      itemPrice = baseItem.unitPrice + sauceItem.unitPrice + cheeseItem.unitPrice + veggieTotal;

      const veggieNames = veggieItems.map((v) => v.name).join(', ');
      itemName = `Custom Pizza (${baseItem.name}, ${sauceItem.name}, ${cheeseItem.name}${veggieNames ? ', ' + veggieNames : ''})`;

      base = baseItem._id;
      sauce = sauceItem._id;
      cheese = cheeseItem._id;
      veggies = veggieItems.map((v) => v._id);
      orderCustomBuild = { base, sauce, cheese, veggies };
    }

    const totalAmount = itemPrice * quantity; // ALWAYS computed here — req.body.totalAmount is never read

    const itemsToDecrement = buildItemsList(base, sauce, cheese, veggies, quantity);
    try {
      await decrementInventory(itemsToDecrement);
    }
     catch (err) {
      return res.status(409).json({message: err.message });
    }

    const order = await Order.create({
      user: req.user._id,
      orderType,
      menuPizza: orderMenuPizza,
      customBuild: orderCustomBuild,
      itemName,
      itemPrice,
      quantity,
      totalAmount,
      paymentStatus: 'pending',
      orderStatus: 'received',
    });

    res.status(201).json(order);
  } 
  catch (err) {
    res.status(500).json({message: 'Server error', error: err.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } 
  catch (err) {
    res.status(500).json({message: 'Server error', error: err.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({createdAt: -1});
    res.json(orders);
  } 
  catch (err) {
    res.status(500).json({message: 'Server error', error: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const {status} = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({message: 'Invalid order status'});
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({message: 'Order not found'});
    }

    order.orderStatus = status;
    await order.save();

    res.json(order);
  } 
  catch (err) {
    res.status(500).json({message: 'Server error', error: err.message });
  }
};

module.exports = {createOrder, getMyOrders, getAllOrders, updateOrderStatus};