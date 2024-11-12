import { useEffect, useState } from "react";
import "../styles/Chat.css";
import { useWebSocket } from "../context/WebSocketContext";
import { useParams, useLocation } from "react-router-dom";

interface Message {
  messageId: string;
  content: string;
  senderId: string;
  recipientId: string;
  timestamp: string;
  read: boolean;
  type: string;
  media_URL: string | null;
}

export default function Chat() {
  const { chatId } = useParams<{ chatId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const userId = localStorage.getItem("userId");
  const location = useLocation();
  const chatPartner = location.state?.chatPartnerName || "Собеседник";

  const ws = useWebSocket();

  useEffect(() => {
    if (chatId && ws && ws.readyState === WebSocket.OPEN) {
      console.log(`Открыт чат с ID: ${chatId}, отправляем запрос на получение сообщений`);
  
      // Отправляем запрос на получение сообщений чата
      ws.send(JSON.stringify({ event: "getChatMessages", data: chatId }));
  
      // Обрабатываем ответ от WebSocket
      ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          console.log("Полученные данные:", response);
  
          // Проверяем, что это событие с сообщениями чата
          if (response.event === "chatMessages") {
            setMessages(response.data || []);
          } else if (response.event === "error") {
            console.error("Ошибка при получении сообщений чата:", response.message);
          }
        } catch (error) {
          console.error("Ошибка при парсинге сообщения:", error);
        }
      };
    }
  }, [chatId, ws]);

  return (
    <div className="chat-container">
      <div className="chat-header">
      <h2>{chatPartner}</h2>
      </div>

      {messages.length === 0 ? (
        <div className="empty-chat">
          <p>Здесь пока нет сообщений. Начните беседу!</p>
        </div>
      ) : (
        <div className="messages-list">
          {messages.map((message) => (
            <div
              key={message.messageId}
              className={`message-item ${
                message.senderId === userId ? "message-left" : "message-right"
              }`}
            >
              <p>{message.content}</p>
              <span>{new Date(message.timestamp).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}


      <div className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Введите сообщение..."
        />
      </div>
    </div>
  );
}
