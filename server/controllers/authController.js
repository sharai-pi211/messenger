import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateToken, AuthToken } from "../utils/middleware.js";
import generateAvatar from "../utils/avatarGenerator.js";

export async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Необходимо заполнить все поля: username, email и password",
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        message:
          "Пароль должен быть не менее 6 символов и содержать цифры и специальные символы.",
      });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "Пользователь уже существует" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const avatar = await generateAvatar(username);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      avatarUrl: avatar,
    });

    await newUser.save();

    const token = generateToken(newUser._id);

    const authToken = new AuthToken(newUser._id);
    authToken.setToken(token, Date.now() + 36000000);

    await newUser.updateOne({ $set: { authToken } });

    res.status(201).json({
      message: "Пользователь успешно зарегистрирован",
      token,
      userId: newUser._id,
      avatar: newUser.avatarUrl,
    });
  } catch (error) {
    console.error("Ошибка при регистрации:", error);
    res.status(500).json({ message: "Произошла ошибка при регистрации" });
  }
}

export async function authenticate(req, res) {
  try {
    console.log('я в логине');
    const { username, password } = req.body;
    console.log(username, password);
    
    const user = await User.findOne({ username });
    console.log(user);
    if (!user) {
      return res.status(401).json({ message: "Неверные учетные данные" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    console.log(isMatch);
    if (!isMatch) {
      return res.status(401).json({ message: "Неверные учетные данные" });
    }

    const token = generateToken(user._id);
    const authToken = new AuthToken(user._id);
    authToken.setToken(token, Date.now() + 36000000);

    await user.updateOne({ $set: { authToken } });

    res.json({ token, userId: user._id });

    let a = { token, userId: user._id };
    console.log(a);
  } catch (error) {
    console.error("Ошибка при аутентификации:", error);
    res.status(500).json({ message: "Произошла ошибка при аутентификации" });
  }
}

export async function isAuthenticated(req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Токен отсутствует" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ _id: decoded.userId });
    if (!user)
      return res.status(404).json({ message: "Пользователь не найден" });

    req.user = decoded;
    next();
  } catch (ex) {
    console.error("Ошибка аутентификации:", ex);
    res.status(400).json({ message: "Неверный токен" });
  }
}

function isValidPassword(password) {
  if (password.length < 6) return false;
  if (!/\d/.test(password)) return false;
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;

  return true;
}
