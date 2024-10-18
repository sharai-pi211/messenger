const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {generateToken, verifyToken} = require('../utils/middleware');
const {AuthToken} = require('../utils/middleware');

async function register(req, res) {
  try {
    if (!req.body.username || !req.body.email || !req.body.password) {
      return res.status(400).json({ 
        message: 'Необходимо заполнить все поля: username, email и password' 
      });
    }
    const { username, email, password } = req.body;

    if (!isValidPassword(password)) {
      return res.status(400).json({ 
        message: 'Пароль должен быть не менее 6 символов, содержать цифры и специальные символы.' 
      });
    }
   
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    //хеширование пароля
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();

    const token = generateToken(newUser._id);
    const authToken = new AuthToken(newUser._id);
    authToken.setToken(token, Date.now() + 36000000); //срок действия токена

    await newUser.updateOne({ $set: { authToken } });

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      token,
      userId: newUser._id
    });
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    res.status(500).json({ message: 'Произошла ошибка при регистрации' });
  }
}

//аутентификация пользователя
async function authenticate(req, res) {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Неверные учетные данные' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Неверные учетные данные' });
    }

    const token = generateToken(user._id);
    const authToken = new AuthToken(user._id);
    authToken.setToken(token, Date.now() + 36000000);

    await user.updateOne({ $set: { authToken } });

    res.json({ token, userId: user._id });
  } catch (error) {
    console.error('Ошибка при аутентификации:', error);
    res.status(500).json({ message: 'Произошла ошибка при аутентификации' });
  }
}

//авторизации
async function isAuthenticated(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Токен отсутствует' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    //существование user
    const user = await User.findOne({ _id: decoded.userId });
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });

    req.user = decoded;
    next();
  } catch (ex) {
    console.error("Ошибка аутентификации:", ex);
    res.status(400).json({ message: "Неверный токен" });
  }
}

function isValidPassword(password) {
  if (password.length < 6) return false;
  if (!/\d/.test(password)) return false;
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;

  return true;
}

module.exports = { register, authenticate, isAuthenticated };