const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref = 'User',
            required: true
        },
        orderType: {
            type: String,
            enum: ['predefined', 'custom'],
            required: true,
        },
        menuPizza: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MenuPizza',
        },
        customBuild: {
            base: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' },
            sauce: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' },
            cheese: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' },
            veggies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' }],
        },
        itemName: {
            type: String,
            required: true
        },
        itemPrice: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1,
        },
        totalAmount: {
            type: Number,
            required: true
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed'],
            default: 'pending'
        },
        paymentId: {
            type: String,
        },
        orderStatus: {
            type: String,
            enum: ['recieved', 'in_kitchen', 'sent_to_delivery'],
            default: 'recieved'
        },
    },
    {timestamps: true}
)


orderSchema.pre('validate', function (next){
    if(this.orderType === 'predefined' && !this.menupizza){
        return next(new Error('menuPizza is required for predifined orders'));
    }
    if (this.orderType === 'custom' && !this.customBuild?.base){
        return next(new Error('customBuild is required for custom orders'));
    }
    next()
})

module.exports = mongoose.model('Order', orderSchema)