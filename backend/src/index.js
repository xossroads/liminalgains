import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/health.js';
import authRoutes from './routes/auth.js';
import entriesRoutes from './routes/entries.js';
import weightRoutes from './routes/weight.js';
import historyRoutes from './routes/history.js';
import foodSearchRoutes from './routes/food-search.js';
import { authenticate } from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());

// Public routes
app.use('/api', healthRoutes);
app.use('/api', authRoutes);

// Protected routes
app.use('/api', authenticate, entriesRoutes);
app.use('/api', authenticate, weightRoutes);
app.use('/api', authenticate, historyRoutes);
app.use('/api', authenticate, foodSearchRoutes);

app.listen(PORT, () => {
  console.log(`Liminal Gains API running on port ${PORT}`);
});
