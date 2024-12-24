import { useState, useEffect } from "react";
import "../styles/AddContactModal.css";
import { useWebSocket } from "../context/WebSocketContext";
import { addSentRequest, removeSentRequest } from "../context/sentRequests";

interface Contact {
  userId: string;
  username: string;
  status: string;
  avatarUrl?: string;
  lastActive: string | null;
}

interface AddContactModalProps {
  onClose: () => void;
}

export default function AddContactModal({ onClose }: AddContactModalProps) {
  const currentUser = localStorage.getItem("userId");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const ws = useWebSocket();

  const fetchContacts = async () => {
    try {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        console.error("User ID отсутствует. Не удаётся выполнить запрос.");
        return;
      }

      const response = await fetch("http://localhost:3000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentUserId: userId }),
      });

      const data = await response.json();
      setContacts(data); // Устанавливаем данные
    } catch (error) {
      console.error("Ошибка при получении пользователей:", error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const handleSendFriendRequest = (userId: string) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          event: "sendFriendRequest",
          data: { userId: currentUser, friendId: userId },
        })
      );
  
      addSentRequest(userId);

      // Обновляем статус локально
      setContacts((prevContacts) =>
        prevContacts.map((contact) =>
          contact.userId === userId ? { ...contact, status: "pending" } : contact
        )
      );
    } else {
      console.error("WebSocket не подключен.");
    }
  };

  const handleCancelFriendRequest = (userId: string) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          event: "cancelFriendRequest",
          data: { userId: currentUser, friendId: userId },
        })
      );

      removeSentRequest(userId);

      // Обновляем статус локально
      setContacts((prevContacts) =>
        prevContacts.map((contact) =>
          contact.userId === userId ? { ...contact, status: "none" } : contact
        )
      );
    } else {
      console.error("WebSocket не подключен.");
    }
  };
  

  // Фильтруем контакты
  const filteredContacts = contacts.filter(
    (contact) =>
      contact.userId !== currentUser && // Исключаем самого пользователя
      contact.status !== "accepted" && // Исключаем друзей
      contact.username.toLowerCase().includes(searchQuery) // Фильтруем по имени
  );

  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <div className="modal">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2>Add Contact</h2>
        <input
          type="text"
          placeholder="Search user..."
          value={searchQuery}
          onChange={handleSearch}
        />
        <div className="modal-contacts-list">
          {filteredContacts.map((contact) => (
            <div key={contact.userId} className="modal-contact-item">
              <div className="avatar">
                {contact.avatarUrl ? (
                  <img src={contact.avatarUrl} alt={contact.username} />
                ) : (
                  <div className="default-avatar">
                    {contact.username.charAt(0)}
                  </div>
                )}
                <span
                  className={`status-indicator ${
                    contact.status === "online" ? "online" : "offline"
                  }`}
                ></span>
              </div>
              <div className="contact-info">
                <p className="contact-name">{contact.username}</p>
                {contact.lastActive && (
                  <p className="contact-last-active">
                    Last Active: {new Date(contact.lastActive).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="contact-actions">
                {contact.status === "none" || contact.status === "rejected" ? (
                  <button
                    className="send-request-button rb"
                    onClick={() => handleSendFriendRequest(contact.userId)}
                  >
                                        <img src={"/add.svg"} alt={"Cancel request"} className="action-icon" />

                  </button>
                ) : contact.status === "pending" ? (
                  <button
                    className="cancel-request-button rb"
                    onClick={() => handleCancelFriendRequest(contact.userId)}
                  >
                    <img src={"/no.svg"} alt={"Cancel request"} className="action-icon" />
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
