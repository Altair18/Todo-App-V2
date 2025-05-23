// backend/index.js
require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const mongoose = require('mongoose');
const projectRoutes = require('./routes/projects')

const app = express();
app.use(cors()); // Enable CORS for all routes so that the frontend can access the backend and talk together
app.use(express.json()); // Parse JSON request bodies so server can read posted data
app.use('/api/projects', projectRoutes)


// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser:    true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routing
  const authRoutes = require('./routes/auth'); // Mount auth routes
app.use('/api/auth', authRoutes);

const taskRoutes = require('./routes/tasks'); // Mount task routes
app.use('/api/tasks', taskRoutes);



// Health check
app.get('/', (req, res) => res.send('✅ API is up and running!'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`)); // listen on the specified port and make api available
//Reads the environment variables from the .env file