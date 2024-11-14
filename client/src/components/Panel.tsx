import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/Panel.css";

export default function Panel() {
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <nav className="navbar">
      <ul className="nav-list">
        <li className="nav-item">
          <Link to="/" className="nav-link" title="Home">
            <img src="/home.svg" alt="Home" className="nav-icon" />
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/contacts" className="nav-link" title="Contacts">
            <img src="/contacts.svg" alt="Contacts" className="nav-icon" />
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/chats" className="nav-link" title="Messages">
            <img src="/messages.svg" alt="Messages" className="nav-icon" />
          </Link>
        </li>
        <li className="nav-item last" id="p-last">
          <Link to="/me" className="nav-link" title="Me">
            <img src="/user.svg" alt="My acc" className="nav-icon" />
          </Link>
        </li>
        <li className="nav-item toggle-theme">
          <button onClick={toggleTheme} className="theme-toggle-button">
            <img
              src={theme === "light" ? "/light.svg" : "/hight.svg"}
              alt={
                theme === "light"
                  ? "Switch to dark theme"
                  : "Switch to light theme"
              }
              className="theme-icon nav-icon"
            />
          </button>
        </li>
      </ul>
    </nav>
  );
}
