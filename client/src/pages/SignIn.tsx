import { useState } from "react";
import "../styles/SignInUp.css";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = () => {
    console.log("Email:", email);
    console.log("Password:", password);
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="title">Sign in</h2>
        <p className="subtitle">Welcome back! Please enter your details.</p>
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
        <button onClick={handleSignIn} className="sign-in-button">
          Sign in
        </button>
        <p className="footer-text">
          Don't have an account?{" "}
          <a href="#" className="sign-up-link">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
