import { Link, Outlet } from "react-router-dom";

export default function Main() {
  return (
    <div className="main-container">
      Тестовая страница чтобы было удобно переходить на роуты
      <nav className="navbar">
        <ul className="nav-list">
          <li className="nav-item">
            <Link to="/" className="nav-link" title="Home">
              <img src="/images/home.png" alt="Home" className="nav-icon" />
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/contacts" className="nav-link" title="Contacts">
              <img src="/contact.png" alt="Contacts" className="nav-icon" />
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/chats" className="nav-link" title="Chats">
              <img src="/contact.png" alt="Chats" className="nav-icon" />
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/sign-in" className="nav-link" title="Sign In">
              <img
                src="/images/sign-in.png"
                alt="Sign In"
                className="nav-icon"
              />
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/sign-up" className="nav-link" title="Sign Up">
              <img
                src="/images/sign-up.png"
                alt="Sign Up"
                className="nav-icon"
              />
            </Link>
          </li>
        </ul>
      </nav>
      <div className="content">
        <Outlet /> {/* Вложенные маршруты будут рендериться здесь */}
      </div>
    </div>
  );
}
