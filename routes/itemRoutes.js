const express = require('express');
const router = express.Router();
const { uploadItem, getAllItems } = require('../controllers/itemController');

router.post('/upload', uploadItem);
router.get('/all', getAllItems); // ✅ add this line

module.exports = router;
