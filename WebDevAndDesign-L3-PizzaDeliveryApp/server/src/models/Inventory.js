const mongoose = require('mongoose')

const inventorySchema = new mongoose.Schema(
    {
        itemType: {
            type: String,
            enum: ['base', 'sauce', 'cheese', 'veggie'],
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true, 
        },
        unitPrice: {
            type: Number,
            required: true,
            min: 0
        },
        stock: {
            type: Number,
            required: true,
            default: 0,
            min: 0
        },
        lowStockThreshold: {
            type: Number,
            required: true,
            default: 20
        },
    },
    {timestamps: true}
)

module.exports = mongoose.model('Inventory', inventorySchema);