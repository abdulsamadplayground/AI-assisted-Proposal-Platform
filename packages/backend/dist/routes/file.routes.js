"use strict";
/**
 * File upload routes
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const uuid_1 = require("uuid");
const router = (0, express_1.Router)();
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'storage/uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueName = `${(0, uuid_1.v4)()}${path_1.default.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow images, PDFs, and documents
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type'));
        }
    },
});
// All routes require authentication
router.use(auth_middleware_1.authenticate);
/**
 * POST /api/files/upload
 * Upload file
 */
router.post('/upload', upload.single('file'), async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/files/:filename
 * Download file
 */
router.get('/:filename', (req, res) => {
    const filePath = path_1.default.join(process.cwd(), 'storage/uploads', req.params.filename);
    res.sendFile(filePath);
});
exports.default = router;
//# sourceMappingURL=file.routes.js.map