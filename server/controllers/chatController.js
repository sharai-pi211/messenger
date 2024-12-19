import { ListCollectionsCursor } from "mongodb";
import Chat from "../models/Chats.js";
import Message from "../models/Message.js";

// создание нового чата или обновление существующего
export async function createOrUpdateChat(...userIds) {
  try {
    const existingChat = await Chat.findOne({
      participants: { $all: userIds },
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
      timestamp: new Date(),
    });

    await newChat.save();
    return newChat;
  } catch (error) {
    console.error("Ошибка при создании или обновлении чата:", error);
    throw error;
  }
}

// получение списка чатов пользователя
export async function getChatsByUser(userId) {
  try {
    const chats = await Chat.find({
      $or: [{ participants: userId }, { participants: { $in: [userId] } }],
    }).populate("participants", "username avatarUrl status lastActive");

    return chats;
  } catch (error) {
    console.error("Ошибка при получении чатов пользователя:", error);
    throw error;
  }
}


// получение сообщений чата
// export async function getChatMessages(chatId) {
//   try {
//     const chat = await Chat.findById(chatId);
//     if (!chat) {
//       throw new Error("Чат не найден");
//     }

//     // Если в чате пока нет сообщений, возвращаем пустой массив
//     if (!chat.messages || chat.messages.length === 0) {
//       console.log("Сообщений в чате нет, возвращаем пустой массив");
//       return [];
//     }

//     const messages = await Message.find({ _id: { $in: chat.messages } });
//     return messages;
//   } catch (error) {
//     console.error("Ошибка при получении сообщений чата:", error);
//     throw error;
//   }
// }

export async function getChatMessages(chatId) {
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      throw new Error("Чат не найден");
    }

    // Если в чате пока нет сообщений, возвращаем пустой массив
    if (!chat.messages || chat.messages.length === 0) {
      console.log("Сообщений в чате нет, возвращаем пустой массив");
      return [];
    }

    // Находим сообщения и популируем данные отправителя
    const messages = await Message.find({ _id: { $in: chat.messages } }).populate({
      path: "sender", // Поле, которое нужно популировать
      select: "username", // Указываем, какие поля нужны
    });

    console.log(messages);

    return messages;
  } catch (error) {
    console.error("Ошибка при получении сообщений чата:", error);
    throw error;
  }
}


/*
export async function createMessage(chatId, sender, content, wss, type = "text") {
  console.log("userId", sender);

  const messageType = Array.isArray(content) && content.length > 0 ? "image" : type;

  const messageData = {
    content,
    sender: sender,
    timestamp: new Date(),
    read: false,
    type: messageType,
    media_URL: messageType === "image" ? content : [],
    is_deleted: false,
    deleted_by: null,
    conversation_id: chatId,
  };

  const message = new Message(messageData);

  try {
    await message.save();
    const chat = await Chat.findById(chatId);
    if (!chat) throw new Error("Чат не найден");

    chat.messages.push(message._id);
    await chat.save();

    const formattedMessage = {
      _id: message._id,
      content: message.content,
      sender: message.sender,
      timestamp: message.timestamp,
      conversation_id: chatId,
      type: message.type,
      media_URL: message.media_URL,
    };

    wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify({ event: "newMessage", data: formattedMessage }));
      }
    });

    return message;
  } catch (error) {
    console.error("Ошибка при создании сообщения:", error);
    throw error;
  }
}
  */


export async function createMessage(chatId, sender, content, wss, type = "text") {
  const messageType = Array.isArray(content) && content.length > 0 ? "image" : type;

  const messageData = {
    content,
    sender: sender,
    timestamp: new Date(),
    read: false,
    type: messageType,
    media_URL: messageType === "image" ? content : [],
    is_deleted: false,
    deleted_by: null,
    conversation_id: chatId,
  };

  const message = new Message(messageData);

  try {
    await message.save();
    
    // Populate sender data
    const populatedMessage = await message.populate("sender", "username avatarUrl");

    const chat = await Chat.findById(chatId);
    if (!chat) throw new Error("Чат не найден");

    chat.messages.push(message._id);
    await chat.save();

    const formattedMessage = {
      _id: message._id,
      content: message.content,
      sender: {
        id: populatedMessage.sender._id,
        username: populatedMessage.sender.username, // Имя пользователя
        avatarUrl: populatedMessage.sender.avatarUrl, // Аватар пользователя
      },
      timestamp: message.timestamp,
      conversation_id: chatId,
      type: message.type,
      media_URL: message.media_URL,
    };

    wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify({ event: "newMessage", data: formattedMessage }));
      }
    });

    return message;
  } catch (error) {
    console.error("Ошибка при создании сообщения:", error);
    throw error;
  }
}

