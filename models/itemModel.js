const { dynamoClient } = require('../config/aws');

const ITEMS_TABLE = 'OLX_Items';

const saveItemToDB = async (item) => {
  const params = {
    TableName: ITEMS_TABLE,
    Item: item
  };
  await dynamoClient.put(params).promise();
};

const getAllItemsFromDB = async () => {
  const params = {
    TableName: ITEMS_TABLE,
  };
  const result = await dynamoClient.scan(params).promise();
  return result.Items;
};

module.exports = { saveItemToDB, getAllItemsFromDB };
