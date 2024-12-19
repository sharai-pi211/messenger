import User from "../models/User.js"; // Путь к вашей модели User

// Получить список друзей пользователя
export const getFriends = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate("friends", "username email avatarUrl status");
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    return res.status(200).json({ friends: user.friends });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
};

// Добавить друга
export const addFriend = async (req, res) => {
  try {
    const { userId } = req.params; // ID текущего пользователя
    const { friendId } = req.body; // ID пользователя, которого добавляем в друзья

    if (userId === friendId) {
      return res.status(400).json({ message: "Нельзя добавить себя в друзья" });
    }

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    // Проверка на уже существующую дружбу
    if (user.friends.includes(friendId)) {
      return res.status(400).json({ message: "Пользователь уже добавлен в друзья" });
    }

    // Добавляем друга в список
    user.friends.push(friendId);
    await user.save();

    // Двусторонняя дружба (опционально)
    friend.friends.push(userId);
    await friend.save();

    return res.status(200).json({ message: "Пользователь добавлен в друзья" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
};
