const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;

const generateToken = (payload) => {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
};

module.exports = { generateToken };
