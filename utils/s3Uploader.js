// utils/s3Uploader.js
const AWS = require('aws-sdk');
require('dotenv').config();

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

const uploadToS3 = (fileBuffer, key, contentType) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
  };

  return s3.upload(params).promise().then((data) => data.Location);
};

module.exports = { uploadToS3 };
