const AWS = require('aws-sdk');
require('dotenv').config();

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// DynamoDB client
const dynamoClient = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = 'OLX_Users2';
const ITEMS_TABLE = 'OLX_Items';

// S3 client
const s3Client = new AWS.S3();

module.exports = {
  dynamoClient,
  USERS_TABLE,
  ITEMS_TABLE,
  s3Client,
};
