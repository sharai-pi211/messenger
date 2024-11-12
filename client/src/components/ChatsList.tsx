import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import "../styles/ContactsList.css";
import Panel from "./Panel";
import formatLastActive from "../utils/formatLastActive";
import AddContactModal from "./AddContactModal";

interface Chat {
  chatId: string;
  userId: string;
  username: string;
  status: string;
  avatarUrl?: string;
  lastActive: string;
}

let ws: WebSocket | null = null;

export default function ChatsList() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const fetchChats = () => {
    const userId = localStorage.getItem("userId");

    if (userId && ws && ws.readyState === WebSocket.OPEN) {
      console.log("Отправляем запрос на получение чатов через WebSocket");
      try {
        ws.send(JSON.stringify({ event: "getUserChats", data: userId }));
      } catch (error) {
        console.error("Ошибка при отправке сообщения:", error);
        setError("Не удалось отправить запрос на получение чатов");
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!ws || ws.readyState === WebSocket.CLOSED) {
      ws = new WebSocket("ws://localhost:3000");

      ws.onopen = () => {
        console.log("WebSocket соединение установлено");
        fetchChats();
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log("Получено сообщение:", message);
      
          if (message.event === "userChats") {
            console.log("Получены чаты через WebSocket:", message.data);
      
            const formattedData = message.data.map((chat: any) => {
              const userId = localStorage.getItem("userId");
              const otherParticipant = chat.participants.find(
                (participant: any) => participant._id !== userId
              );
      
              return {
                chatId: chat._id,
                userId: otherParticipant._id,
                username: otherParticipant.username,
                status: otherParticipant.status,
                avatarUrl: otherParticipant.avatarUrl,
                lastActive: otherParticipant.lastActive || "",
              };
            });
      
            setChats(formattedData);
            setFilteredChats(formattedData);
            setLoading(false);
          } else if (message.event === "chatUpdated") {
            console.log("Чат обновлён, выполняется обновление списка чатов");
            fetchChats(); // Запрос на обновление списка чатов
          } else if (message.event === "error") {
            console.error("Ошибка через WebSocket:", message.message);
            setError(message.message);
            setLoading(false);
          }
        } catch (error) {
          console.error("Ошибка при парсинге сообщения:", error);
          setError("Ошибка при обработке данных");
          setLoading(false);
        }
      };
      

      ws.onerror = (error) => {
        console.error("Ошибка WebSocket:", error);
        // setError("Ошибка подключения к WebSocket серверу");
        setLoading(false);
      };

      ws.onclose = () => {
        console.log("WebSocket соединение закрыто");
        // setError("Соединение с сервером потеряно");
        setLoading(false);
      };
    }

    // Очистка соединения при размонтировании компонента
    return () => {
      if (ws) {
        ws.close();
        ws = null;
      }
    };
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = chats.filter((chat) =>
      chat.username.toLowerCase().includes(query)
    );
    setFilteredChats(filtered);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  if (loading) {
    return <div>Загрузка чатов...</div>;
  }

  if (error) {
    return <div>Ошибка: {error}</div>;
  }

  return (
    <div className="row">
      <Panel />
      <div className="contacts-container">
        <div className="header">
          <h1>Chats</h1>
          <button className="add-contact-button" onClick={openModal}>
            +
          </button>
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search here..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div className="contacts-list">
          {filteredChats.map((chat) => (
            <div key={chat.chatId} className="contact-item">
              <div className="avatar">
                {chat.avatarUrl ? (
                  <img src={chat.avatarUrl} alt={chat.username} />
                ) : (
                  <div className="default-avatar">
                    {chat.username.charAt(0)}
                  </div>
                )}
                <span
                  className={`status-indicator ${
                    chat.status === "online" ? "online" : "offline"
                  }`}
                ></span>
              </div>
              <div className="contact-info">
                <p className="contact-name">{chat.username}</p>
                {chat.status !== "online" && (
                  <p className="contact-last-active">
                    Last active: {formatLastActive(chat.lastActive)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && <AddContactModal onClose={closeModal} />}
      <Outlet />
    </div>
  );
}
