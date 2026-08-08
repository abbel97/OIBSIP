const Inventory = require('../models/Inventory');
const sendEmail = require('../utils/sendEmail');
const { buildEmailHTML } = require('../utils/emailTemplates');

const checkLowStock = async () =>  {
    const lowStockItems = await Inventory.find({
        $expr: { $lt: ['$stock', '$lowStockThreshold'] },
        lowStockNotified: false,
    });

    if(lowStockItems.length === 0){
        return {checked: true, alertScent: 0};
    }

    const itemListHtml = lowStockItems
        .map((item) => `<li>${item.name} (${item.itemType}) — ${item.stock} left, threshold ${item.lowStockThreshold}</li>`)
        .join('');

    await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: `⚠️ Low Stock Alert - ${lowStockItems.length} item(s) need restocking`,
        html: buildEmailHTML({
        heading: 'Low Stock Alert',
        bodyText: `The following ingredients have fallen below their restock threshold:<ul style="text-align:left;">${itemListHtml}</ul>`,
        ctaText: 'Open Inventory Dashboard',
        ctaUrl: `${process.env.CLIENT_URL}/admin/inventory`,
        expiryText: 'This is an automated alert — you will not be notified again for these items until they are restocked.',
        }),
  });

    await Inventory.updateMany(
        { _id: { $in: lowStockItems.map((i) => i._id) } },
        { $set: { lowStockNotified: true } }
    );

    return {checked: true, alertsSent: lowStockItems.length, items: lowStockItems.map((i) => i.name)};
};

module.exports = checkLowStock;
