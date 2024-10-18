//контроллер для работы с чатами
const Chat = require('../models/Chats');
const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');

//создание нового чата или обновление существующего
async function createOrUpdateChat(...userIds) {
  try {
    const existingChat = await Chat.findOne({
      $or: userIds.map(id => ({
        participants: { $in: [id] }
      }))
    });

    if (existingChat) {
      existingChat.lastMessage = null;
      existingChat.timestamp = new Date();
      await existingChat.save();
      return existingChat;
    }

    const newChat = new Chat({
      participants: userIds,
      lastMessage: null,
      timestamp: new Date()
    });

    await newChat.save();
    return newChat;
  } catch (error) {
    console.error('Ошибка при создании или обновлении чата:', error);
    throw error;
  }
}

//получение списка чатов пользователя
async function getChatsByUser(userId) {
  try {
    const chats = await Chat.find({
      $or: [
        { participants: userId },
        { participants: { $in: [userId] } }
      ]
    });
    return chats;
  } catch (error) {
    console.error('Ошибка при получении чатов пользователя:', error);
    throw error;
  }
}

//получение сообщений чата
async function getChatMessages(chatId) {
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      throw new Error('Чат не найден');
    }

    const messages = await Message.find({ chatId: { $in: chat.messages } });
    return messages;
  } catch (error) {
    console.error('Ошибка при получении сообщений чата:', error);
    throw error;
  }
}

//создание нового сообщения в чате
async function createMessage(chatId, userId, content) {
  const message = new Message({
    content,
    sender: userId,
    timestamp: new Date(),
    read: false,
    type: 'text',
    media_URL: null,
    is_deleted: false,
    deleted_by: null
  });

  try {
    await message.save();
    const chat = await Chat.findById(chatId);
    if (!chat) {
      throw new Error('Чат не найден');
    }
    chat.messages.push(message._id);
    await chat.save();

    return message;
  } catch (error) {
    console.error('Ошибка при создании сообщения:', error);
    throw error;
  }
}

module.exports = {
  createOrUpdateChat,
  getChatsByUser,
  getChatMessages,
  createMessage
};