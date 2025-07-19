const AWS = require('aws-sdk');
const bcrypt = require('bcrypt');
const { getUserByEmail, createUser, getUserByPhone } = require('../models/userModel');
const { generateToken } = require('../utils/jwt');

const otpStore = {}; // { phone: { otp: '123456', expires: timestamp } }

// Configure SNS
const sns = new AWS.SNS({ region: process.env.AWS_REGION });

// 1. Send OTP
const sendOtp = async (req, res) => {
  const { phone } = req.body;
  console.log('📩 [sendOtp] Phone received:', phone);

  if (!phone) return res.status(400).json({ message: 'Phone is required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 5 * 60 * 1000; // expires in 5 minutes

  // Store OTP
  otpStore[phone] = { otp, expires };
  console.log(`📦 [sendOtp] OTP generated: ${otp} for phone: ${phone}`);

  try {
    const result = await sns.publish({
      Message: `Your OLX app verification code is: ${otp}`,
      PhoneNumber: phone.startsWith('+') ? phone : '+91' + phone, // ensure E.164 format
    }).promise();

    console.log('✅ [sendOtp] SNS publish success:', result);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('❌ [sendOtp] SNS publish failed:', err.message);
    console.error('❌ [sendOtp] Full error:', err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

// 2. Verify OTP
const verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;
  const record = otpStore[phone];
  console.log(`🔍 [verifyOtp] OTP entered: ${otp}, stored: ${record?.otp}`);

  if (!record) return res.status(400).json({ message: 'No OTP sent' });
  if (Date.now() > record.expires) return res.status(400).json({ message: 'OTP expired' });
  if (otp !== record.otp) return res.status(400).json({ message: 'Invalid OTP' });

  res.status(200).json({ message: 'OTP verified' });
};

// 3. Register after OTP
const register = async (req, res) => {
  const { name, phone, email, password } = req.body;
  console.log(`📝 [register] Input:`, { name, phone, email });

  if (!name || !phone || !email || !password)
    return res.status(400).json({ message: 'All fields are required' });

  const record = otpStore[phone];
  if (!record || Date.now() > record.expires)
    return res.status(400).json({ message: 'Phone not verified or OTP expired' });

  const existingUser = await getUserByPhone(phone);
  if (existingUser) return res.status(400).json({ message: 'User already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = { name, phone, email, password: hashedPassword };

  await createUser(user);
  delete otpStore[phone]; // cleanup
  console.log(`✅ [register] User registered: ${email}`);
  res.status(201).json({ message: 'User registered successfully' });
};

// 4. Login
const login = async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password)
    return res.status(400).json({ message: 'Phone and password required' });

  const user = await getUserByPhone(phone); // <-- Change here
  if (!user) return res.status(404).json({ message: 'User not found' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

  const token = generateToken({ phone: user.phone, name: user.name });
  res.status(200).json({ token, user: { name: user.name, phone: user.phone } });
};


module.exports = { register, login, sendOtp, verifyOtp };
