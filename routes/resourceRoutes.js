const express = require('express');
const upload = require('../middlewares/multerMiddleware'); // Import multer configuration
const { uploadResource } = require('../controllers/resourceController');

const router = express.Router();

router.post('/upload', upload.single('file'), uploadResource);

module.exports = router;
