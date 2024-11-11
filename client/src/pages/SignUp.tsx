import { useState } from "react";
import "../styles/SignInUp.css";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: name,
          email,
          password,
        }),
      });

      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (response.ok) {
          console.log("Пользователь успешно зарегистрирован:", data);

          localStorage.setItem("token", data.token);
          localStorage.setItem("username", data.username);
          localStorage.setItem("userId", data.userId);

          navigate("/chats");
        } else {
          console.error("Ошибка при регистрации:", data.message);
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
        <h2 className="title">Sign up</h2>
        <div className="input-group">
          <label htmlFor="name" className="label">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            placeholder="your name"
          />
        </div>
        <div className="input-group">
          <label htmlFor="email" className="label">
            Email address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="user@gmail.com"
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
        <button onClick={handleSignUp} className="sign-in-button">
          Sign up
        </button>
        <p className="footer-text">
          Already have an account?{" "}
          <a href="/sign-in" className="sign-up-link">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
