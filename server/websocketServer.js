// websocketServer.js
import { WebSocketServer } from "ws";
import { getChatsByUser, getChatMessages } from "./controllers/chatController.js";

export function setupWebSocket(server, app) {
  const wss = new WebSocketServer({ server });

  app.set("wss", wss);

  wss.on("connection", (ws) => {
    console.log("Новое WebSocket-соединение установлено");

    ws.on("ping", () => {
        console.log("Получен пинг от клиента");
        socket.emit("pong");
      });

    ws.on("message", async (message) => {
      try {
        const parsedMessage = JSON.parse(message);
        console.log("Получено сообщение:", parsedMessage);
  
        const { event, data } = parsedMessage;

        // Обработка события получения чатов пользователя
        if (event === "getUserChats") {
          const userId = data;
          const chats = await getChatsByUser(userId);
          ws.send(JSON.stringify({ event: "userChats", data: chats }));

        // Обработка события получения сообщений чата
        } else if (event === "getChatMessages") {
          const chatId = data;
          const messages = await getChatMessages(chatId);
          ws.send(JSON.stringify({ event: "chatMessages", data: messages }));

        // Обработка неизвестного события
        } else {
          ws.send(JSON.stringify({ event: "error", message: "Неизвестное событие" }));
        }
      } catch (error) {
        console.error("Ошибка при обработке сообщения:", error);
        ws.send(JSON.stringify({ event: "error", message: "Ошибка сервера" }));
      }
    });

    ws.on("close", () => {
      console.log("Соединение закрыто");
    });
  });

  console.log("WebSocket сервер запущен");
}
