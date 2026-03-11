require('dotenv').config();
const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const entriesRoutes = require('./routes/entries');
const weightRoutes = require('./routes/weight');
const { authenticate } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Public routes
app.use('/api', healthRoutes);
app.use('/api', authRoutes);

// Protected routes
app.use('/api', authenticate, entriesRoutes);
app.use('/api', authenticate, weightRoutes);

app.listen(PORT, () => {
  console.log(`Liminal Gains API running on port ${PORT}`);
});
