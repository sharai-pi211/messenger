import { useEffect, useState, useRef } from "react";
import "../styles/Chat.css";
import { useWebSocket } from "../context/WebSocketContext";
import { useParams, useLocation } from "react-router-dom";

interface Message {
  messageId: string;
  content: string;
  sender: string;
  timestamp: string;
  type: string;
  media_URL?: string;
}

export default function Chat() {
  const { chatId } = useParams<{ chatId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const userId = localStorage.getItem("userId");
  const location = useLocation();
  const chatPartner = location.state?.chatPartnerName || "Собеседник";
  const ws = useWebSocket();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (chatId && ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ event: "getChatMessages", data: chatId }));

      ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          if (response.event === "chatMessages") {
            setMessages(response.data || []);
          } else if (response.event === "newMessage" && response.data.conversation_id === chatId) {
            setMessages((prevMessages) => [...prevMessages, response.data]);
          }
        } catch (error) {
          console.error("Ошибка при парсинге сообщения:", error);
        }
      };
    }
  }, [chatId, ws]);

  const handleSendMessage = () => {
    if (!newMessage.trim() && !selectedFile) return;

    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const messageData = {
          event: "createMessage",
          data: {
            chatId,
            sender: userId,
            type: "image",
            content: reader.result,
          },
        };
        ws?.send(JSON.stringify(messageData));
        setSelectedFile(null);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      const messageData = {
        event: "createMessage",
        data: {
          chatId,
          sender: userId,
          type: "text",
          content: newMessage,
        },
      };
      ws?.send(JSON.stringify(messageData));
      setNewMessage("");
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>{chatPartner}</h2>
      </div>

      <div className="messages-list">
        {messages.map((message) => (
          <div key={message.messageId} className={`message-item ${message.sender === userId ? "message-right" : "message-left"}`}>
            {message.type === "image" ? (
              <img src={message.content} alt="Изображение" className="message-image" />
            ) : (
              <p>{message.content}</p>
            )}
            <span>{new Date(message.timestamp).toLocaleString()}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Введите сообщение..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSendMessage();
            }
          }}
        />
        <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
        <button className="m-send" onClick={handleSendMessage}>
          ➜
        </button>
      </div>
    </div>
  );
}
