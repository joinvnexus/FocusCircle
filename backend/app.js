const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const communityRoutes = require('./routes/communityRoutes');
const taskRoutes = require('./routes/taskRoutes');
const commentRoutes = require('./routes/commentRoutes');

dotenv.config();

// Connect to DB only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);

// Serve frontend
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).send('API endpoint not found');
  }
  res.sendFile(path.resolve(frontendPath, 'index.html'));
});

module.exports = app;
