import { WebSocketServer } from "ws";
import {
  getChatsByUser,
  getChatMessages,
  createMessage,
} from "./controllers/chatController.js";
import { updateUserStatus } from "./controllers/userController.js";
import User from "./models/User.js";

export function setupWebSocket(server, app) {
  const wss = new WebSocketServer({ server });

  app.set("wss", wss);

  wss.on("connection", (ws) => {
    console.log("Новое WebSocket-соединение установлено");

    ws.on("message", async (message) => {
      try {
        const parsedMessage = JSON.parse(message);
        const { event, data } = parsedMessage;

        if (event === "userOnline") {
          const { userId } = data;
          ws.userId = userId;
          console.log(`Пользователь ${userId} онлайн`);
          await updateUserStatus(userId, "online");
          await broadcastUserStatus(wss);
        } else if (event === "userOffline") {
          const { userId } = data;
          console.log(`Пользователь ${userId} оффлайн`);
          await updateUserStatus(userId, "offline");
          await broadcastUserStatus(wss);
        } else if (event === "getUserChats") {
          const userId = data;
          const chats = await getChatsByUser(userId);
          ws.send(JSON.stringify({ event: "userChats", data: chats }));
        } else if (event === "getChatMessages") {
          const chatId = data;
          const messages = await getChatMessages(chatId);
          ws.send(JSON.stringify({ event: "chatMessages", data: messages }));
        } else if (event === "createMessage") {
          const { chatId, sender, content } = data;
          await createMessage(chatId, sender, content, wss);
        } else {
          ws.send(
            JSON.stringify({ event: "error", message: "Неизвестное событие" })
          );
        }
      } catch (error) {
        console.error("Ошибка при обработке сообщения:", error);
        ws.send(JSON.stringify({ event: "error", message: "Ошибка сервера" }));
      }
    });

    ws.on("close", async () => {
      console.log("Соединение закрыто");
      const userId = ws.userId;
      console.log(userId);

      if (userId) {
        await updateUserStatus(userId, "offline");
        await broadcastUserStatus(wss);
      }
    });
  });

  console.log("WebSocket сервер запущен");
}

async function broadcastUserStatus(wss) {
  try {
    const users = await User.find({}, "username status lastActive");
    const statusData = users.map((user) => ({
      userId: user._id,
      username: user.username,
      status: user.status,
      lastActive: user.lastActive,
    }));

    wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify({ event: "userStatus", data: statusData }));
      }
    });
  } catch (error) {
    console.error("Ошибка при рассылке статуса пользователей:", error);
  }
}
