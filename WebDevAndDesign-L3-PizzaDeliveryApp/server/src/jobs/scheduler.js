const cron = require('node-cron');
const checkLowStock = require('./lowStockCheck');

const startScheduleJobs = () => {
    cron.schedule('0 8 * * *', async () => {
        console.log('Running scheduled low-stock check....');
        try{
            const result = await checkLowStock();
            console.log('Low-stock check completed:', result);
        }
        catch(err){
            console.error('Low-stock check failed:', err.message);
        }
    });

    console.log('Scheduled jobs started');
};

module.exports = startScheduleJobs;
