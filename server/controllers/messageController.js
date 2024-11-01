import Message from "../models/Message.js";

// Получение всех сообщений
export async function getAllMessages() {
  try {
    const messages = await Message.find().sort({ timestamp: -1 });
    return messages;
  } catch (error) {
    console.error("Ошибка при получении всех сообщений:", error);
    throw error;
  }
}

// Получение конкретного сообщения
export async function getMessageById(id) {
  try {
    const message = await Message.findById(id);
    if (!message) {
      throw new Error("Сообщение не найдено");
    }
    return message;
  } catch (error) {
    console.error("Ошибка при получении сообщения:", error);
    throw error;
  }
}

// Обновление статуса прочтения сообщения
export async function updateReadStatus(id) {
  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      id,
      { $set: { read: true } },
      { new: true },
    );
    if (!updatedMessage) {
      throw new Error("Сообщение не найдено");
    }
    return updatedMessage;
  } catch (error) {
    console.error("Ошибка при обновлении статуса прочтения:", error);
    throw error;
  }
}
