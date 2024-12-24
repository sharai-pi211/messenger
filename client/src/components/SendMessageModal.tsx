import { useState, useEffect } from "react";
import "../styles/AddContactModal.css";
import { useWebSocket } from "../context/WebSocketContext";

interface Contact {
  _id: string;
  username: string;
  status: string;
  avatarUrl?: string;
  lastActive: string | null;
}

interface Chat {
  chatId: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  lastActive: string;
  status: string;
}

interface SendMessageModalProps {
  onClose: () => void;
  onChatCreated: (chat: Chat) => void; // Функция для обновления списка чатов
}

export default function SendMessageModal({ onClose, onChatCreated }: SendMessageModalProps) {
  const currentUser = localStorage.getItem("userId");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const ws = useWebSocket();

//   const fetchContacts = async () => {
//     try {
//       const userId = localStorage.getItem("userId");

//       if (!userId) {
//         console.error("User ID отсутствует. Не удаётся выполнить запрос.");
//         return;
//       }

//       const response = await fetch("http://localhost:3000/api/users", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ currentUserId: userId }),
//       });

//       const data = await response.json();
//       setContacts(data); // Устанавливаем данные
//     } catch (error) {
//       console.error("Ошибка при получении пользователей:", error);
//     }
//   };

const fetchContacts = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/getAvailableContacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentUserId: localStorage.getItem("userId") }),
      });
  
      const data = await response.json();
      setContacts(data); // Устанавливаем список доступных контактов
    } catch (error) {
      console.error("Ошибка при получении доступных контактов:", error);
    }
  };
  

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const handleSendMessage = async (userId: string) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error("WebSocket не подключен.");
      return;
    }

    try {
      // Создаем или находим чат
      ws.send(
        JSON.stringify({
          event: "createChat",
          data: { userIds: [currentUser, userId] },
        })
      );

      const onMessageHandler = (event: MessageEvent) => {
        const response = JSON.parse(event.data);

        if (response.event === "chatUpdated") {
          const chatId = response.data._id;

          const newChat: Chat = {
            chatId,
            userId,
            username: response.data.participants.find(
              (p: any) => p._id !== currentUser
            )?.username,
            status: "online",
            avatarUrl: response.data.avatarUrl || "",
            lastActive: response.data.lastActive || "",
          };

          // Отправляем сообщение в найденный или созданный чат
          ws.send(
            JSON.stringify({
              event: "createMessage",
              data: {
                chatId,
                sender: currentUser,
                content: message,
              },
            })
          );

          onChatCreated(newChat); // Вызываем функцию для обновления списка чатов
          setMessage(""); // Очистить поле сообщения
          ws.removeEventListener("message", onMessageHandler); // Удаляем обработчик
        }
      };

      ws.addEventListener("message", onMessageHandler);
    } catch (error) {
      console.error("Ошибка при отправке сообщения:", error);
    }
  };

  // Фильтруем контакты
  const filteredContacts = contacts.filter(
    (contact) =>
      contact._id !== currentUser && // Исключаем самого пользователя
      contact.username.toLowerCase().includes(searchQuery) // Фильтруем по имени
  );

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleClose = () => {
    setMessage(""); // Очистка сообщения при закрытии модалки
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <button className="close-button" onClick={handleClose} aria-label="Close">
          &times;
        </button>
        <h2>Send Message</h2>
        <input
          type="text"
          placeholder="Search user..."
          value={searchQuery}
          onChange={handleSearch}
        />
        <textarea
          className="message-input-modal"
          placeholder="Write your message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="modal-contacts-list">
          {filteredContacts.map((contact) => (
            <div key={contact._id} className="modal-contact-item">
              <div className="avatar">
                {contact.avatarUrl ? (
                  <img src={contact.avatarUrl} alt={contact.username} />
                ) : (
                  <div className="default-avatar">
                    {contact.username.charAt(0)}
                  </div>
                )}
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
                <button
                  className="send-message-button rb"
                  onClick={() => handleSendMessage(contact._id)}
                  disabled={!message.trim()} // Кнопка отключена, если сообщение пустое
                  aria-label={`Send message to ${contact.username}`}
                >
                  <img src={"/send.svg"} alt={"Отправить"} className="send-mod-icon" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
