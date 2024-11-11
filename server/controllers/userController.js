// Контроллер для управления пользователями
import User from "../models/User.js";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";

const { sign } = jwt;

export async function login(username, password) {
  try {
    const user = await User.findOne({ username });

    if (!user || !(await compare(password, user.password))) {
      return null;
    }

    const token = sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    return { userId: user._id, token };
  } catch (error) {
    console.error("Ошибка при аутентификации:", error);
    throw error;
  }
}

// Получение информации о пользователе
export async function getUserInfo(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Пользователь не найден");
    }
    return user;
  } catch (error) {
    console.error("Ошибка при получении информации о пользователе:", error);
    throw error;
  }
}

// Обновление информации о пользователе
export async function updateUser(userId, username, email) {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { username, email } },
      { new: true },
    );
    if (!user) {
      throw new Error("Пользователь не найден");
    }
    return user;
  } catch (error) {
    console.error("Ошибка при обновлении информации о пользователе:", error);
    throw error;
  }
}

export async function deleteUser(userId) {
  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      throw new Error("Пользователь не найден");
    }
    return deletedUser;
  } catch (error) {
    console.error("Ошибка при удалении пользователя:", error);
    throw error;
  }
}

export async function getAllUsers() {
  try {
    const users = await User.find({}, "_id username status avatarUrl lastActive");

    if (!users.length) {
      throw new Error("Пользователи не найдены");
    }

    const formattedUsers = users.map((user) => ({
      userId: user._id.toString(),
      username: user.username,
      status: user.status,
      avatarUrl: user.avatarUrl,
      lastActive: user.lastActive,
    }));

    return formattedUsers;
  } catch (error) {
    console.error("Ошибка при получении списка пользователей:", error);
    throw error;
  }
}
