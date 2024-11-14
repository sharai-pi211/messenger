import { useEffect, useState } from "react";
import Panel from "../components/Panel";
import "../styles/Me.css";

export default function Me() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Пользователь не авторизован.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/api/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Ошибка при запросе:", error);
        setError("Произошла ошибка при получении данных.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div>Ошибка: {error}</div>;
  }

  return (
    <div className="me-page row">
      <Panel />

      <div className="me-container">
        <div className="me-card">
          <img src={user?.avatarUrl} alt="Avatar" className="me-avatar" />
          <h2 className="me-username">{user?.username}</h2>
          <p className="me-email">Email: {user?.email}</p>
          <p className="me-created">
            Дата создания: {new Date(user?.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
