const cloudinary = require('../config/cloudinary');
const Resource = require('../models/Resource');
const fs = require('fs');

const uploadResource = async (req, res) => {
    console.log("Testing upload resource");
    try {
        console.log('File received:', req.file);
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'study-resources',
        });

        const resource = new Resource({
            name: req.body.name,
            description: req.body.description,
            fileUrl: result.secure_url,
        });

        await resource.save();

        // Remove the temporary file
        fs.unlinkSync(req.file.path);

        res.status(201).json({ message: 'Resource uploaded successfully', resource });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports={uploadResource};