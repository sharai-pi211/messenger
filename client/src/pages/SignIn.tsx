import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SignInUp.css";
import { useAuth } from "../context/AuthContext";

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSignIn = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      console.log(JSON.stringify(response));

      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (response.ok) {
          console.log("Пользователь успешно вошел:", data);

          localStorage.setItem("token", data.token);
          // localStorage.setItem("username", data.username);
          localStorage.setItem("userId", data.userId);

          login(data.token);

          navigate("/chats");
        } else {
          console.error("Ошибка при входе:", data.message);
        }
      } else {
        const errorText = await response.text();
        console.error("Ошибка от сервера:", errorText);
      }
    } catch (error) {
      console.error("Ошибка запроса:", error);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="title">Sign in</h2>
        <p className="subtitle">Welcome back! Please enter your details.</p>
        <div className="input-group">
          <label htmlFor="username" className="label">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input"
            placeholder="your username"
          />
        </div>

        <div className="input-group">
          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder="•••••••••••••••"
          />
        </div>
        <button onClick={handleSignIn} className="sign-in-button">
          Sign in
        </button>
        <p className="footer-text">
          Don't have an account?{" "}
          <a href="/sign-up" className="sign-up-link">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
