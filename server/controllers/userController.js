//кронтроллер для управления пользователями
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function login(username, password) {
  try {
    const user = await User.findOne({ username });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return null;
    }
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return { userId: user._id, token };
  } catch (error) {
    console.error('Ошибка при аутентификации:', error);
    throw error;
  }
}

//получение информации о пользователе
async function getUserInfo(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Пользователь не найден');
    }
    return user;
  } catch (error) {
    console.error('Ошибка при получении информации о пользователе:', error);
    throw error;
  }
}

//обновления информации о пользователе
async function updateUser(userId, username, email) {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { username, email } },
      { new: true }
    );
    if (!user) {
      throw new Error('Пользователь не найден');
    }
    return user;
  } catch (error) {
    console.error('Ошибка при обновлении информации о пользователе:', error);
    throw error;
  }
}

async function deleteUser(userId) {
  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      throw new Error('Пользователь не найден');
    }
    return deletedUser;
  } catch (error) {
    console.error('Ошибка при удалении пользователя:', error);
    throw error;
  }
}

module.exports = {
  login,
  getUserInfo,
  updateUser,
  deleteUser
};