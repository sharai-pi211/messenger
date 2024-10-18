require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
/*const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');*/

const app = express();
const PORT = process.env.PORT || 3000;

//app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(cors());

/*//статические файлы
const staticPath = path.join(__dirname, '../public');
app.use(express.static(staticPath));*/

// API routes
const apiRoutes = require('./routes/apiRoutes');
app.use('/api', apiRoutes);

/*//Frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});*/

// Обработчик ошибок
mongoose.connect(process.env.MONGODB_URI, {})
.then(() => console.log('Подключение к базе данных успешно'))
.catch((err) => console.error('Ошибка подключения:', err));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Что-то сломалось!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;