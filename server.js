require('dotenv').config();              
const express   = require('express');
const connectDB = require('./config/db');
const eventRoutes = require('./routes/eventRoutes');

const app = express();


connectDB();


app.use(express.json());


app.use('/api/events', eventRoutes);


app.get('/', (_, res) => res.send('Event Management API is running.'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server started on port ${PORT}`)
);
