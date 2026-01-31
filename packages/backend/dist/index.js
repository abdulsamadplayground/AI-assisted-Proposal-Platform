"use strict";
/**
 * Backend API Gateway
 * Main entry point for the AI Proposal Platform backend
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("./utils/logger");
const errorHandler_1 = require("./middleware/errorHandler");
const requestLogger_1 = require("./middleware/requestLogger");
// Import routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const proposal_routes_1 = __importDefault(require("./routes/proposal.routes"));
const schema_routes_1 = __importDefault(require("./routes/schema.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const file_routes_1 = __importDefault(require("./routes/file.routes"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Request logging
app.use(requestLogger_1.requestLogger);
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
    const dbConfigured = !!(process.env.DB_HOST &&
        process.env.DB_NAME &&
        process.env.DB_USER &&
        process.env.DB_PASSWORD);
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
app.use('/api/auth', auth_routes_1.default);
app.use('/api/proposals', proposal_routes_1.default);
app.use('/api/schemas', schema_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/files', file_routes_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
    });
});
// Error handling middleware (must be last)
app.use(errorHandler_1.errorHandler);
// Only start server if not in serverless environment
if (process.env.VERCEL !== '1') {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        logger_1.logger.info(`🚀 API Gateway running on http://localhost:${PORT}`);
        logger_1.logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
        logger_1.logger.info(`🔗 AI Service: ${process.env.AI_SERVICE_URL || 'http://localhost:8000'}`);
    });
}
// Graceful shutdown
process.on('SIGTERM', () => {
    logger_1.logger.info('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});
process.on('SIGINT', () => {
    logger_1.logger.info('SIGINT signal received: closing HTTP server');
    process.exit(0);
});
exports.default = app;
//# sourceMappingURL=index.js.map