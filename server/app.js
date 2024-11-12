// app.js
import "dotenv/config";
import express, { json, urlencoded } from "express";
import { connect } from "mongoose";
import cors from "cors";
import http from "http";
import { setupWebSocket } from "./websocketServer.js"; // Новый файл с WebSocket-сервером

const app = express();
const PORT = process.env.PORT || 3000;

// Создаем HTTP-сервер для Express
const server = http.createServer(app);

app.use(json());
app.use(urlencoded({ extended: false }));

// Настраиваем CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Подключаем маршруты API
import apiRoutes from "./routes/apiRoutes.js";
app.use("/api", apiRoutes);

// Подключаемся к базе данных MongoDB
connect(process.env.MONGODB_URI, {})
  .then(() => console.log("Подключение к базе данных успешно"))
  .catch((err) => console.error("Ошибка подключения:", err));

// Обработчик ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Что-то сломалось!");
});

// Настраиваем WebSocket-сервер
setupWebSocket(server, app);

// Запускаем HTTP-сервер
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

export default app;
