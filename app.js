const express = require('express');
const cors = require('cors');
const app = express();

const authRoutes = require('./routes/authRoutes'); // ✅ Add this line
const itemRoutes = require('./routes/itemRoutes'); // already correct

app.use(cors({origin:"*"}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
