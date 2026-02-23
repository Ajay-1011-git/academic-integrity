const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
require('./config/firebase');

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    message: 'VIT Academic Integrity Platform API',
    status: 'running',
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
const professorRoutes = require('./routes/professorRoutes');
app.use('/api/professor', professorRoutes);
const studentRoutes = require('./routes/studentRoutes');
app.use('/api/student', studentRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});
