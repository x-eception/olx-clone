const { dynamoClient, USERS_TABLE } = require('../config/aws');

const getUserByPhone = async (phone) => {
  const params = {
    TableName: USERS_TABLE,
    Key: { phone },
  };

  const data = await dynamoClient.get(params).promise(); // ✅ correct
  return data.Item;
};


const createUser = async (user) => {
  const params = {
    TableName: USERS_TABLE,
    Item: user,
  };
  await dynamoClient.put(params).promise();
};



module.exports = {
  createUser,
  getUserByPhone, // <-- export this too
};
