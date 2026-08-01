require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Inventory = require('../models/Inventory');
const MenuPizza = require('../models/MenuPizza');

const inventoryData = [
  // bases
  { itemType: 'base', name: 'Thin Crust', unitPrice: 2.0, stock: 100, lowStockThreshold: 20 },
  { itemType: 'base', name: 'Thick Crust', unitPrice: 2.5, stock: 100, lowStockThreshold: 20 },
  { itemType: 'base', name: 'Cheese Burst', unitPrice: 3.5, stock: 100, lowStockThreshold: 20 },
  { itemType: 'base', name: 'Whole Wheat', unitPrice: 2.2, stock: 100, lowStockThreshold: 20 },
  { itemType: 'base', name: 'Gluten-Free', unitPrice: 3.0, stock: 60, lowStockThreshold: 15 },

  // sauces
  { itemType: 'sauce', name: 'Tomato', unitPrice: 1.0, stock: 100, lowStockThreshold: 20 },
  { itemType: 'sauce', name: 'BBQ', unitPrice: 1.2, stock: 100, lowStockThreshold: 20 },
  { itemType: 'sauce', name: 'Pesto', unitPrice: 1.5, stock: 80, lowStockThreshold: 20 },
  { itemType: 'sauce', name: 'Alfredo', unitPrice: 1.5, stock: 80, lowStockThreshold: 20 },
  { itemType: 'sauce', name: 'Spicy Arrabbiata', unitPrice: 1.3, stock: 80, lowStockThreshold: 20 },

  // cheese
  { itemType: 'cheese', name: 'Mozzarella', unitPrice: 1.5, stock: 100, lowStockThreshold: 20 },
  { itemType: 'cheese', name: 'Cheddar', unitPrice: 1.5, stock: 100, lowStockThreshold: 20 },
  { itemType: 'cheese', name: 'Parmesan', unitPrice: 1.8, stock: 60, lowStockThreshold: 15 },

  // veggies
  { itemType: 'veggie', name: 'Onion', unitPrice: 0.5, stock: 150, lowStockThreshold: 30 },
  { itemType: 'veggie', name: 'Capsicum', unitPrice: 0.5, stock: 150, lowStockThreshold: 30 },
  { itemType: 'veggie', name: 'Mushroom', unitPrice: 0.7, stock: 100, lowStockThreshold: 25 },
  { itemType: 'veggie', name: 'Olive', unitPrice: 0.6, stock: 100, lowStockThreshold: 25 },
  { itemType: 'veggie', name: 'Corn', unitPrice: 0.5, stock: 120, lowStockThreshold: 25 },
  { itemType: 'veggie', name: 'Jalapeno', unitPrice: 0.6, stock: 100, lowStockThreshold: 25 },
  { itemType: 'veggie', name: 'Tomato', unitPrice: 0.5, stock: 120, lowStockThreshold: 25 },
  { itemType: 'veggie', name: 'Spinach', unitPrice: 0.6, stock: 80, lowStockThreshold: 20 },
];

const seed = async () => {
  await connectDB();

  console.log('Clearing existing Inventory and MenuPizza data...');
  await Inventory.deleteMany({});
  await MenuPizza.deleteMany({});

  console.log('Inserting inventory...');
  const inventory = await Inventory.insertMany(inventoryData);
  const find = (name) => inventory.find((i) => i.name === name)._id;

  const menuPizzaData = [
    {
      name: 'Margherita',
      description: 'Classic tomato sauce and mozzarella on a thin crust.',
      price: 6.99,
      recipe: {
        base: find('Thin Crust'),
        sauce: find('Tomato'),
        cheese: find('Mozzarella'),
        veggies: [],
      },
    },
    {
      name: 'Veggie Delight',
      description: 'Loaded with onion, capsicum and mushroom on a thick crust.',
      price: 8.49,
      recipe: {
        base: find('Thick Crust'),
        sauce: find('Tomato'),
        cheese: find('Mozzarella'),
        veggies: [find('Onion'), find('Capsicum'), find('Mushroom')],
      },
    },
    {
      name: 'Farmhouse',
      description: 'Cheese burst base with cheddar, corn, onion and capsicum.',
      price: 9.49,
      recipe: {
        base: find('Cheese Burst'),
        sauce: find('Tomato'),
        cheese: find('Cheddar'),
        veggies: [find('Corn'), find('Onion'), find('Capsicum')],
      },
    },
    {
      name: 'BBQ Special',
      description: 'BBQ sauce, mozzarella, onion and jalapeno on thin crust.',
      price: 9.99,
      recipe: {
        base: find('Thin Crust'),
        sauce: find('BBQ'),
        cheese: find('Mozzarella'),
        veggies: [find('Onion'), find('Jalapeno')],
      },
    },
  ];

  console.log('Inserting menu pizzas...');
  await MenuPizza.insertMany(menuPizzaData);

  console.log('Seeding complete.');
  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});