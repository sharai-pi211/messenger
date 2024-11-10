import "dotenv/config";
import express, { json, urlencoded } from "express";
import { connect } from "mongoose";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

const app = express();
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(json());
app.use(urlencoded({ extended: false }));

app.use(
  cors({
    origin: "http://localhost:3001", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);


import apiRoutes from "./routes/apiRoutes.js";
app.use("/api", apiRoutes);

connect(process.env.MONGODB_URI, {})
  .then(() => console.log("Подключение к базе данных успешно"))
  .catch((err) => console.error("Ошибка подключения:", err));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Что-то сломалось!");
});

io.on("connection", (socket) => {
  console.log("Новое подключение WebSocket:", socket.id);

  socket.on("sendMessage", (data) => {
    console.log("Получено сообщение:", data);

    io.emit("newMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("Клиент отключился:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

export default app;
