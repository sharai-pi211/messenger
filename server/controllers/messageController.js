//контроллер работы с сообщениями
const express = require('express');
const mongoose = require('mongoose');
const Message = require('../models/Message');
const Chat = require('../models/Chats');
const User = require('../models/User');

//получение всех сообщений
async function getAllMessages() {
  try {
    const messages = await Message.find().sort({ timestamp: -1 });
    return messages;
  } catch (error) {
    console.error('Ошибка при получении всех сообщений:', error);
    throw error;
  }
}

//получение конкретного сообщения
async function getMessageById(id) {
  try {
    const message = await Message.findById(id);
    if (!message) {
      throw new Error('Сообщение не найдено');
    }
    return message;
  } catch (error) {
    console.error('Ошибка при получении сообщения:', error);
    throw error;
  }
}

//обновление статуса прочтения сообщения
async function updateReadStatus(id) {
  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      id,
      { $set: { read: true } },
      { new: true }
    );
    if (!updatedMessage) {
      throw new Error('Сообщение не найдено');
    }
    return updatedMessage;
  } catch (error) {
    console.error('Ошибка при обновлении статуса прочтения:', error);
    throw error;
  }
}

module.exports = {
  getAllMessages,
  getMessageById,
  updateReadStatus
};