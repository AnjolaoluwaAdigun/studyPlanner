const cloudinary = require("../config/cloudinary");
const Resource = require("../models/Resource");
const fs = require("fs");

const uploadResource = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  if (!req.body.name || !req.body.description) {
    return res.status(400).json({ message: "Name and description required" });
  }

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "study-resources",
    });

    console.log("file url:", result.secure_url);

    const resource = new Resource({
      name: req.body.name,
      description: req.body.description,
      fileUrl: result.secure_url,
    });

    await resource.save();

    // Remove the temporary file
    fs.unlinkSync(req.file.path);

    res
      .status(201)
      .json({ message: "Resource uploaded successfully", resource });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const getResources = async (req, res) => {
  try {
    // Fetch all resources from the database
    const resources = await Resource.find(); // This will fetch all the resources

    if (resources.length === 0) {
      return res.status(404).json({ message: "No resources found" });
    }

    res.status(200).json(resources); // Send the resources as a JSON response
  } catch (error) {
    console.error("Error fetching resources:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { uploadResource,getResources };

