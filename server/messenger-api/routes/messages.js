const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

//получение всех сообщений
router.get('/', async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении сообщений' });
  }
});

//получение конкретного сообщения
router.get('/:id', async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Сообщение не найдено' });
    }
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка' });
  }
});

//создание нового сообщения
  router.post('/', async (req, res) => {
    const { text, sender, recipient } = req.body;

    if (!text || !sender || !recipient) {
      return res.status(400).json({ message: 'Ошибка' });
    }

    const newMessage = new Message({
      text,
      sender,
      recipient,
      timestamp: new Date()
    });

    try {
      await newMessage.save();
      res.status(201).json(newMessage);
    } catch (error) {
      res.status(500).json({ message: 'Ошибка' });
    }
  });

//статуса прочтения сообщения
router.patch('/:id', async (req, res) => {
  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      req.params.id,
      { $set: { read: true } },
      { new: true }
    );
    if (!updatedMessage) {
      return res.status(404).json({ message: 'Сообщение не найдено' });
    }
    res.json(updatedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении статуса' });
  }
});

module.exports = router;
