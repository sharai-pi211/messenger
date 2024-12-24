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

export async function updateUser(userId, username, email) {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { username, email } },
      { new: true }
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

export async function getAllUsers(currentUserId) {
  try {
    // Получаем текущего пользователя с заполнением друзей
    const currentUser =
      await User.findById(currentUserId).populate("friends.friendId");

    if (!currentUser) {
      throw new Error("Текущий пользователь не найден");
    }

    // Получаем всех пользователей с заполнением их друзей
    const users = await User.find(
      {},
      "_id username status avatarUrl lastActive friends"
    ).populate("friends.friendId", "_id username avatarUrl lastActive");

    if (!users.length) {
      throw new Error("Пользователи не найдены");
    }

    // Создаём карту статусов друзей
    const friendStatusMap = new Map(
      currentUser.friends.map((friend) => [
        friend.friendId._id.toString(),
        friend.status,
      ])
    );

    // Форматируем пользователей
    const formattedUsers = users
      .filter((user) => user._id.toString() !== currentUserId) // Исключаем текущего пользователя
      .map((user) => {
        const status = friendStatusMap.get(user._id.toString()) || "none"; // Проверяем статус дружбы
        return {
          userId: user._id.toString(),
          username: user.username,
          status: status, // Устанавливаем статус
          avatarUrl: user.avatarUrl || null, // Устанавливаем avatarUrl
          lastActive: user.lastActive || null, // Устанавливаем lastActive
        };
      });

    return formattedUsers;
  } catch (error) {
    console.error("Ошибка при получении списка пользователей:", error);
    throw error;
  }
}

export async function updateUserStatus(userId, status) {
  try {
    const validStatuses = ["online", "offline"];
    if (!validStatuses.includes(status)) {
      throw new Error("Недопустимый статус пользователя");
    }

    await User.findByIdAndUpdate(userId, {
      status,
      lastActive: new Date(),
    });
  } catch (error) {
    console.error("Ошибка при обновлении статуса пользователя:", error);
  }
}
