// Полный импорт модуля и деструктуризация
import jwt from "jsonwebtoken";
const { sign, verify, JsonWebTokenError, TokenExpiredError } = jwt;

// Генерация JWT токена
export function generateToken(user) {
  return sign({ userId: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

// Проверка токена
export function verifyToken(token) {
  try {
    const decoded = verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      console.error("Ошибка при верификации токена:", error.message);
    } else if (error instanceof TokenExpiredError) {
      console.error("Срок действия токена истек:", error.message);
    }
    throw error;
  }
}

// Класс для работы с аутентификационным токеном
export class AuthToken {
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
