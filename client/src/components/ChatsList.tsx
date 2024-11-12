import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import "../styles/ContactsList.css";
import Panel from "./Panel";
import formatLastActive from "../utils/formatLastActive";
import AddContactModal from "./AddContactModal";
import { useWebSocket } from "../context/WebSocketContext";

interface Chat {
  chatId: string;
  userId: string;
  username: string;
  status: string;
  avatarUrl?: string;
  lastActive: string;
}

export default function ChatsList() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const ws = useWebSocket();

  const fetchChats = () => {
    const userId = localStorage.getItem("userId");

    if (userId && ws && ws.readyState === WebSocket.OPEN) {
      
      ws.send(JSON.stringify({ event: "getUserChats", data: userId }));
    }
  };

  useEffect(() => {
    if (!ws) {
      
      return;
    }
  
    // Проверяем состояние WebSocket перед отправкой
    if (ws.readyState === WebSocket.OPEN) {
      fetchChats();
    } else {
      
      ws.onopen = () => {
        
        fetchChats();
      };
    }
  
    // Обработчик сообщений WebSocket
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
  
        if (message.event === "userChats") {
          
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
          // setChats(message.data);
          // setFilteredChats(message.data);
          // setLoading(false);
        } else if (message.event === "error") {
          
          setError(message.message);
          setLoading(false);
        }
      } catch (error) {
        
      }
    };
  
    // Очистка обработчиков при размонтировании
    return () => {
      if (ws) {
        ws.onopen = null;
        ws.onmessage = null;
      }
    };
  }, [ws]);
  


  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = chats.filter((chat) =>
      chat.username.toLowerCase().includes(query)
    );
    setFilteredChats(filtered);
  };

  const handleChatClick = (chatId: string, chatPartnerName: string) => {
    console.log(`Нажат чат ${chatId}, собеседник: ${chatPartnerName}`);
    navigate(`/chats/${chatId}`, { state: { chatPartnerName } });
  };
  

  return (
    <div className="row">
      <Panel />
      <div className="contacts-container">
        <div className="header">
          <h1>Chats</h1>
          <button className="add-contact-button" onClick={() => setIsModalOpen(true)}>
            +
          </button>
        </div>
        <div className="contacts-list">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search here..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          {filteredChats.map((chat) => (
            <div key={chat.chatId} className="contact-item" onClick={() => handleChatClick(chat.chatId, chat.username)}>
              <div className="avatar">
                {chat.avatarUrl ? (
                  <img src={chat.avatarUrl} alt={chat.username} />
                ) : (
                  <div className="default-avatar">{chat.username.charAt(0)}</div>
                )}
                <span className={`status-indicator ${chat.status === "online" ? "online" : "offline"}`}></span>
              </div>
              <div className="contact-info">
                <p className="contact-name">{chat.username}</p>
                {chat.status !== "online" && (
                  <p className="contact-last-active">Last active: {formatLastActive(chat.lastActive)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {isModalOpen && <AddContactModal onClose={() => setIsModalOpen(false)} />}
      <Outlet />
    </div>
  );
}
