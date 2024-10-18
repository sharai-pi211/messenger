//файл для вспомогательных функций
const jwt = require('jsonwebtoken');

//генерация JWT токена
function generateToken(user) {
  const token = jwt.sign(
    { userId: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  return token;
}

//проверка токена
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  } catch (error) {
    console.error('Ошибка при верификации токена:', error);
    throw error;
  }
}


//токен аутентификации для user
class AuthToken {
  constructor(userId) {
    this.userId = userId;
    this.token = null;
    this.expirationDate = null;
  }

  setToken(token, expirationDate) {
    this.token = token;
    this.expirationDate = expirationDate;
  }

  getToken() {
    return this.token;
  }

  getExpirationDate() {
    return this.expirationDate;
  }

  hasExpired() {
    return this.expirationDate && Date.now() > this.expirationDate;
  }
}

module.exports = AuthToken;
module.exports = {generateToken, verifyToken};