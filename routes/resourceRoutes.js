const express = require('express');
const upload = require('../middlewares/multerMiddleware'); // Import multer configuration
const { uploadResource,getResources } = require('../controllers/resourceController');

const router = express.Router();

router.post('/upload', upload.single('file'), uploadResource);
router.get('/', getResources);

module.exports = router;
