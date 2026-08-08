require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const startScheduleJobs = require('./jobs/scheduler');

connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
})