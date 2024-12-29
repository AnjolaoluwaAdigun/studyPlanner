const multer = require('multer');
const path = require('path');

// Define storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Ensure this directory exists
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

// Define file filter
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('application/')) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Unsupported file type'), false); // Reject the file
    }
};

// Set upload limits
const limits = {
    fileSize: 50 * 1024 * 1024, // 50 MB
};

// Initialize multer
const upload = multer({ storage, fileFilter, limits });

module.exports = upload;
