/**
 * Backend API Gateway
 * Main entry point for the AI Proposal Platform backend
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

// Import routes
import authRoutes from './routes/auth.routes';
import proposalRoutes from './routes/proposal.routes';
import schemaRoutes from './routes/schema.routes';
import userRoutes from './routes/user.routes';
import fileRoutes from './routes/file.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'api-gateway',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: process.env.DB_CLIENT || 'not configured',
  });
});

// Database status endpoint
app.get('/api/status', (req, res) => {
  const dbConfigured = !!(
    process.env.DB_HOST &&
    process.env.DB_NAME &&
    process.env.DB_USER &&
    process.env.DB_PASSWORD
  );

  res.json({
    status: dbConfigured ? 'configured' : 'missing_database',
    message: dbConfigured
      ? 'Database is configured'
      : 'PostgreSQL database not configured. Please add DB_HOST, DB_NAME, DB_USER, DB_PASSWORD environment variables in Vercel dashboard.',
    database: {
      client: process.env.DB_CLIENT || 'not set',
      host: process.env.DB_HOST ? '***configured***' : 'not set',
      name: process.env.DB_NAME || 'not set',
    },
    services: {
      frontend: process.env.FRONTEND_URL || 'not set',
      aiService: process.env.AI_SERVICE_URL || 'not set',
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/schemas', schemaRoutes);
app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Only start server if not in serverless environment
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    logger.info(`🚀 API Gateway running on http://localhost:${PORT}`);
    logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔗 AI Service: ${process.env.AI_SERVICE_URL || 'http://localhost:8000'}`);
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

export default app;
