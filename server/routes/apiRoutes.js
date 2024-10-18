//файл для маршрутов API
const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Chat = require('../models/Chats');
const Message = require('../models/Message');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const {getAllMessages, getMessageById, updateReadStatus} = require('../controllers/messageController');
const {createOrUpdateChat, getChatsByUser, getChatMessages, createMessage} = require('../controllers/chatController');
const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.authenticate);

//информация о пользователе
router.get('/me', authController.isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Ошибка при получении информации о пользователе:', error);
    res.status(500).json({ message: 'Произошла ошибка при получении информации о пользователе' });
  }
});

//обновление информации пользователя
router.put('/update', authController.isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { username, email } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { username, email } },
      { new: true }
    );


    res.json(updatedUser);
  } catch (error) {
    console.error('Ошибка при обновлении информации о пользователе:', error);
    res.status(500).json({ message: 'Произошла ошибка при обновлении информации о пользователе' });
  }
});

router.delete('/delete', authController.isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.userId;
    const deletedUser = await userController.deleteUser(userId);
    res.json(deletedUser);
  } catch (error) {
    console.error('Ошибка при удалении пользователя:', error);
    res.status(500).json({ message: 'Произошла ошибка при удалении пользователя' });
  }
});


//чаты
router.post('/chats', async (req, res) => {
  try {
    const userIds = Object.values(req.body);

    if (userIds.length < 2) {
      return res.status(400).json({ error: 'Нужны минимум два пользователя для создания чата' });
    }

    const uniqueUserIds = [...new Set(userIds)];
    if (uniqueUserIds.length !== userIds.length) {
      return res.status(400).json({ error: 'Дубликаты пользователей недопустимы' });
    }

    const chat = await createOrUpdateChat(...uniqueUserIds);

    res.status(201).json(chat);
  } catch (error) {
    console.error('Ошибка при создании чата:', error);
    res.status(500).json({ message: 'Произошла ошибка при создании чата', error: error.message });
  }
});

router.get('/chats/user/:userId', async (req, res) => {
  try {
    const chats = await getChatsByUser(req.params.userId);
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении чатов пользователя', error: error.message });
  }
});

//сообщения
router.post('/messages', authController.isAuthenticated, async (req, res) => {
  try {
    const { chatId, content } = req.body;

    if (!chatId || !content) {
      return res.status(400).json({ error: 'Нужны параметры chatId и content' });
    }

    const userId = req.user._id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Чат не найден' });
    }

    const newMessage = await createMessage(chatId, userId, content);

    res.status(201).json({
      message: 'Сообщение создано успешно',
      data: newMessage
    });

  } catch (error) {
    console.error('Ошибка при создании сообщения:', error);
    res.status(500).json({ error: 'Ошибка при создании сообщения' });
  }
});

router.get('/messages', authController.isAuthenticated, async (req, res) => {
  try {
    const messages = await getAllMessages();
    res.json(messages);
  } catch (error) {
    console.error('Ошибка при получении всех сообщений:', error);
    res.status(500).json({ message: 'Произошла ошибка при получении всех сообщений' });
  }
});

router.get('/messages/:id', authController.isAuthenticated, async (req, res) => {
  try {
    const message = await getMessageById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Сообщение не найдено' });
    }
    res.json(message);
  } catch (error) {
    console.error('Ошибка при получении сообщения:', error);
    res.status(500).json({ message: 'Произошла ошибка при получении сообщения' });
  }
});

router.put('/messages/:id/read', authController.isAuthenticated, async (req, res) => {
  try {
    const updatedMessage = await updateReadStatus(req.params.id);
    if (!updatedMessage) {
      return res.status(404).json({ message: 'Сообщение не найдено' });
    }
    res.json(updatedMessage);
  } catch (error) {
    console.error('Ошибка при обновлении статуса прочтения:', error);
    res.status(500).json({ message: 'Произошла ошибка при обновлении статуса прочтения' });
  }
});

module.exports = router;