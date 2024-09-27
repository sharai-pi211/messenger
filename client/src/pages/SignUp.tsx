import { useState } from "react";
import "../styles/SignInUp.css";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSignIn = () => {
    console.log("Email:", email);
    console.log("Password:", password);
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
            type="name"
            id="name"
            onChange={(e) => setEmail(e.target.value)}
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
        <button onClick={handleSignIn} className="sign-in-button">
          Sign up
        </button>
        <p className="footer-text">
        Already have an account?{" "}
          <a href="#" className="sign-up-link">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
