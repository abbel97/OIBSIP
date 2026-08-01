const mongoose = require('mongoose')

const menuPizzaSchema = new mongoose.Schema(
    {
        name: {
            type: String, 
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: ''
        },
        image: {
            type: String,
            default: ''
        },
        price: {
            type: Number,
            required: true,
            min:  0
        },
        recipe: {
            base: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
            sauce: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
            cheese: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
            veggies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' }],
        },
        isActive: {
            type: Boolean,
            default: true
        },
    },
    {timestamps: true}
)

module.exports = mongoose.model('MenuPizza', menuPizzaSchema)