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

export async function addReactionToMessage(messageId, emoji, userId) {
  const message = await Message.findById(messageId);
  if (!message) {
    throw new Error("Message not found");
  }

  const existingReaction = message.reactions.find(
    (reaction) => reaction.emoji === emoji && reaction.userId.toString() === userId
  );

  if (existingReaction) {
    return;
  }

  message.reactions.push({ emoji, userId });
  await message.save();
  return message;
}

export async function removeReactionFromMessage(messageId, emoji, userId) {
  const message = await Message.findById(messageId);
  if (!message) {
    throw new Error("Message not found");
  }

  message.reactions = message.reactions.filter(
    (reaction) => !(reaction.emoji === emoji && reaction.userId.toString() === userId)
  );

  await message.save();
  return message;
}
