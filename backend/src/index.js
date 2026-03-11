require('dotenv').config();
const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/health');
const entriesRoutes = require('./routes/entries');
const weightRoutes = require('./routes/weight');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', healthRoutes);
app.use('/api', entriesRoutes);
app.use('/api', weightRoutes);

app.listen(PORT, () => {
  console.log(`Liminal Gains API running on port ${PORT}`);
});
