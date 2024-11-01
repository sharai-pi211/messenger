import "dotenv/config";
import express, { json, urlencoded } from "express";
import { connect } from "mongoose";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cors());

// API routes
import apiRoutes from "./routes/apiRoutes.js";
app.use("/api", apiRoutes);

// Подключение к базе данных
connect(process.env.MONGODB_URI, {})
  .then(() => console.log("Подключение к базе данных успешно"))
  .catch((err) => console.error("Ошибка подключения:", err));

// Обработчик ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Что-то сломалось!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
