// import { WebSocketServer } from "ws";
// import {
//   getChatsByUser,
//   getChatMessages,
//   createMessage,
// } from "./controllers/chatController.js";
// import { updateUserStatus } from "./controllers/userController.js";
// import User from "./models/User.js";

// export function setupWebSocket(server, app) {
//   const wss = new WebSocketServer({ server });

//   app.set("wss", wss);

//   wss.on("connection", (ws) => {
//     console.log("Новое WebSocket-соединение установлено");

//     ws.on("message", async (message) => {
//       try {
//         const parsedMessage = JSON.parse(message);
//         const { event, data } = parsedMessage;

//         if (event === "userOnline") {
//           const { userId } = data;
//           ws.userId = userId;
//           console.log(`Пользователь ${userId} онлайн`);
//           await updateUserStatus(userId, "online");
//           await broadcastUserStatus(wss);
//         } else if (event === "userOffline") {
//           const { userId } = data;
//           console.log(`Пользователь ${userId} оффлайн`);
//           await updateUserStatus(userId, "offline");
//           await broadcastUserStatus(wss);
//         } else if (event === "getUserChats") {
//           const userId = data;
//           const chats = await getChatsByUser(userId);
//           ws.send(JSON.stringify({ event: "userChats", data: chats }));
//         } else if (event === "getChatMessages") {
//           const chatId = data;
//           const messages = await getChatMessages(chatId);
//           ws.send(JSON.stringify({ event: "chatMessages", data: messages }));
//         } else if (event === "createMessage") {
//           const { chatId, sender, content } = data;
//           await createMessage(chatId, sender, content, wss);
//         } else {
//           ws.send(
//             JSON.stringify({ event: "error", message: "Неизвестное событие" })
//           );
//         }
//       } catch (error) {
//         console.error("Ошибка при обработке сообщения:", error);
//         ws.send(JSON.stringify({ event: "error", message: "Ошибка сервера" }));
//       }
//     });

//     ws.on("close", async () => {
//       console.log("Соединение закрыто");
//       const userId = ws.userId;
//       console.log(userId);

//       if (userId) {
//         await updateUserStatus(userId, "offline");
//         await broadcastUserStatus(wss);
//       }
//     });
//   });

//   console.log("WebSocket сервер запущен");
// }

// async function broadcastUserStatus(wss) {
//   try {
//     const users = await User.find({}, "username status lastActive");
//     const statusData = users.map((user) => ({
//       userId: user._id,
//       username: user.username,
//       status: user.status,
//       lastActive: user.lastActive,
//     }));

//     wss.clients.forEach((client) => {
//       if (client.readyState === client.OPEN) {
//         client.send(JSON.stringify({ event: "userStatus", data: statusData }));
//       }
//     });
//   } catch (error) {
//     console.error("Ошибка при рассылке статуса пользователей:", error);
//   }
// }

/*
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

        // Обновление статуса
        if (event === "userOnline") {
          const { userId } = data;
          ws.userId = userId;
          await updateUserStatus(userId, "online");
          await broadcastUserStatus(wss);
        } else if (event === "userOffline") {
          const { userId } = data;
          await updateUserStatus(userId, "offline");
          await broadcastUserStatus(wss);
        }

        // Получение списка друзей
        else if (event === "getUserFriends") {
          const { userId } = data;
          const user = await User.findById(userId).populate(
            "friends",
            "username avatarUrl status lastActive"
          );

          if (!user) {
            ws.send(
              JSON.stringify({
                event: "error",
                message: "Пользователь не найден",
              })
            );
            return;
          }

          ws.send(
            JSON.stringify({
              event: "userFriends",
              data: user.friends,
            })
          );
        }

        // Добавление друга
        else if (event === "addFriend") {
          const { userId, friendId } = data;

          if (userId === friendId) {
            ws.send(
              JSON.stringify({
                event: "error",
                message: "Нельзя добавить себя в друзья",
              })
            );
            return;
          }

          const user = await User.findById(userId);
          const friend = await User.findById(friendId);

          if (!user || !friend) {
            ws.send(
              JSON.stringify({
                event: "error",
                message: "Пользователь не найден",
              })
            );
            return;
          }

          if (user.friends.includes(friendId)) {
            ws.send(
              JSON.stringify({
                event: "error",
                message: "Пользователь уже добавлен в друзья",
              })
            );
            return;
          }

          user.friends.push(friendId);
          await user.save();

          // Добавляем двустороннюю дружбу (опционально)
          friend.friends.push(userId);
          await friend.save();

          ws.send(
            JSON.stringify({
              event: "friendAdded",
              message: "Пользователь добавлен в друзья",
            })
          );
        }

        // Обработка неизвестных событий
        else {
          ws.send(
            JSON.stringify({ event: "error", message: "Неизвестное событие" })
          );
        }
      } catch (error) {
        console.error("Ошибка при обработке сообщения:", error);
        ws.send(JSON.stringify({ event: "error", message: "Ошибка сервера" }));
      }
    });

    // Обновление статуса при закрытии соединения
    ws.on("close", async () => {
      const userId = ws.userId;
      if (userId) {
        await updateUserStatus(userId, "offline");
        await broadcastUserStatus(wss);
      }
    });
  });

  console.log("WebSocket сервер запущен");
}

// Широковещательная рассылка статуса пользователей
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
}*/



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

        // Обновление статуса
        if (event === "userOnline") {
          const { userId } = data;
          ws.userId = userId;
          await updateUserStatus(userId, "online");
          await broadcastUserStatus(wss);
        } else if (event === "userOffline") {
          const { userId } = data;
          await updateUserStatus(userId, "offline");
          await broadcastUserStatus(wss);
        }

        else if (event === "userOffline") {
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
        } 

        else if (event === "getUserFriends") {
          const { userId } = data;
        
          try {
            // Находим пользователя и заполняем поле friends.friendId
            const user = await User.findById(userId).populate({
              path: "friends.friendId", // Указываем путь для populate
              select: "username avatarUrl status lastActive", // Только нужные поля
            });

            console.log("Популяция результата:", user.friends);

        
            if (!user) {
              ws.send(
                JSON.stringify({
                  event: "error",
                  message: "Пользователь не найден",
                })
              );
              return;
            }
        
            // Преобразуем друзей в удобный формат
            /*const friendsList = user.friends
              .filter((friend) => friend.friendId) // Исключаем записи с пустым friendId
              .map((friend) => ({
                _id: friend.friendId._id,
                username: friend.friendId.username,
                avatarUrl: friend.friendId.avatarUrl,
                status: friend.friendId.status,
                lastActive: friend.friendId.lastActive,
                friendshipStatus: friend.status, // Статус дружбы: pending, accepted, rejected
              }));*/
        
            ws.send(
              JSON.stringify({
                event: "getuserFriends",
                data: user.friends,
              })
            );
        
            console.log("getuserFriends",
              JSON.stringify({
                event: "getuserFriends",
                data: user.friends,
              })
            );
          } catch (error) {
            console.error("Ошибка при получении списка друзей:", error);
            ws.send(
              JSON.stringify({
                event: "error",
                message: "Ошибка сервера",
              })
            );
          }
        }
        
        

        // Отправить запрос дружбы
        else if (event === "sendFriendRequest") {
          const { userId, friendId } = data;

          console.log(userId, friendId);

          if (userId === friendId) {
            ws.send(
              JSON.stringify({
                event: "error",
                message: "Нельзя отправить запрос самому себе",
              })
            );
            return;
          }

          const user = await User.findById(userId);
          const friend = await User.findById(friendId);

          console.log(user, friend);

          if (!user || !friend) {
            ws.send(
              JSON.stringify({
                event: "error",
                message: "Пользователь не найден",
              })
            );
            return;
          }

          // Проверка на существующий запрос
          if (
            user.friends.some(
              (f) => f.friendId.toString() === friendId && f.status === "pending"
            )
          ) {
            ws.send(
              JSON.stringify({
                event: "error",
                message: "Запрос уже отправлен этому пользователю",
              })
            );
            return;
          }

          user.friends.push({ friendId, status: "pending" });
          friend.friends.push({ friendId: userId, status: "pending" });
          await user.save();
          await friend.save();

          console.log(user, friend);

          ws.send(
            JSON.stringify({
              event: "friendRequestSent",
              message: "Запрос отправлен",
            })
          );
        }

        // Принять запрос дружбы
        else if (event === "acceptFriendRequest") {
          const { userId, requestorId } = data;

          const user = await User.findById(userId);
          const requestor = await User.findById(requestorId);

          if (!user || !requestor) {
            ws.send(
              JSON.stringify({
                event: "error",
                message: "Пользователь не найден",
              })
            );
            return;
          }

          // Обновление статуса на "accepted"
          user.friends = user.friends.map((f) => {
            if (f.friendId.toString() === requestorId) f.status = "accepted";
            return f;
          });

          requestor.friends = requestor.friends.map((f) => {
            if (f.friendId.toString() === userId) f.status = "accepted";
            return f;
          });

          await user.save();
          await requestor.save();

          ws.send(
            JSON.stringify({
              event: "friendRequestAccepted",
              message: "Запрос принят",
            })
          );
        }

        // Отклонить запрос дружбы
        else if (event === "rejectFriendRequest") {
          const { userId, requestorId } = data;

          const user = await User.findById(userId);
          const requestor = await User.findById(requestorId);

          if (!user || !requestor) {
            ws.send(
              JSON.stringify({
                event: "error",
                message: "Пользователь не найден",
              })
            );
            return;
          }

          // Удаление запроса
          user.friends = user.friends.filter(
            (f) => f.friendId.toString() !== requestorId
          );
          requestor.friends = requestor.friends.filter(
            (f) => f.friendId.toString() !== userId
          );

          await user.save();
          await requestor.save();

          ws.send(
            JSON.stringify({
              event: "friendRequestRejected",
              message: "Запрос отклонён",
            })
          );
        }

        else {
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
      const userId = ws.userId;
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