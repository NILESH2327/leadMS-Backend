import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { errorHandler, notFound } from './middlewares/errorMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Serverless MongoDB connection middleware
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI environment variable is missing');
  }
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB Connected');
};

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database Connection Error:', err.message);
    res.status(500).json({ message: 'Database Connection Error', error: err.message });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/admin', adminRoutes);

// Base route for health check / welcome
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the CRM Backend API. Services are running smoothly.' });
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

// Start server only if not running in a serverless environment (like Vercel)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the app for Vercel serverless function
export default app;
