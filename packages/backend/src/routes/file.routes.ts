/**
 * File upload routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../middleware/auth.middleware';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'storage/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, PDFs, and documents
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/files/upload
 * Upload file
 */
router.post('/upload', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: `/api/files/${req.file.filename}`,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/files/:filename
 * Download file
 */
router.get('/:filename', (req: Request, res: Response) => {
  const filePath = path.join(process.cwd(), 'storage/uploads', req.params.filename);
  res.sendFile(filePath);
});

export default router;
