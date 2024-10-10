require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;


mongoose.connect(process.env.MONGODB_URI, {})
  .then(() => console.log('Подключение к базе данных успешно'))
  .catch((err) => console.error('Ошибка подключения:', err));


app.use(express.json());
app.use('/api/auth', authRoutes);
app.use(cors());
app.use('/api/messages', require('./routes/messages'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));