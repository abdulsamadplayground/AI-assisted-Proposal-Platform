/**
 * Vercel Serverless Function Entry Point
 * This wraps the Express app for serverless deployment
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/index';

// Export handler for Vercel serverless
export default async (req: VercelRequest, res: VercelResponse) => {
  // Let Express handle the request
  return app(req, res);
};


