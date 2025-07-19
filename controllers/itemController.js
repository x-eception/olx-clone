const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const { uploadToS3 } = require('../utils/s3Uploader');
const { saveItemToDB, getAllItemsFromDB } = require('../models/itemModel');

// Set up multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Updated to accept up to 5 images
const uploadItem = [
  upload.array('images', 5), // name="images", up to 5 files
  async (req, res) => {
    try {
      const { title, description, price, phone } = req.body;
      const files = req.files;

      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'At least one image is required' });
      }

      // Upload each image to S3 and store the returned URLs
      const imageUrls = await Promise.all(
        files.map(async (file) => {
          const fileExt = path.extname(file.originalname);
          const key = `${phone}/${uuidv4()}${fileExt}`;
          return await uploadToS3(file.buffer, key, file.mimetype);
        })
      );

      const item = {
        id: uuidv4(),
        phone,
        title,
        description,
        price,
        images: imageUrls, // ✅ changed from imageUrl to images (array)
        createdAt: new Date().toISOString()
      };

      await saveItemToDB(item);
      res.status(201).json({ message: 'Item posted successfully', item });
    } catch (err) {
      console.error('❌ Error uploading item:', err);
      res.status(500).json({ message: 'Failed to upload item', error: err.message });
    }
  }
];

const getAllItems = async (req, res) => {
  try {
    const items = await getAllItemsFromDB();
    res.status(200).json(items);
  } catch (err) {
    console.error('❌ Error fetching items:', err);
    res.status(500).json({ message: 'Failed to fetch items', error: err.message });
  }
};

module.exports = {
  uploadItem,
  getAllItems,
};
