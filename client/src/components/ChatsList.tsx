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

export default function ChatsList() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const fetchChats = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const response = await fetch(
        `http://localhost:3000/api/chats/user/${userId}`
      );
      const data = await response.json();

      console.log("Полученные чаты:", data);

      const formattedData = data.map((chat: any) => {
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
    } catch (error: unknown) {
      console.error("Ошибка при получении чатов:", error);
      setError(error instanceof Error ? error.message : String(error));
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchChats();
  }, []);

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

      {/* Модальное окно для добавления контакта */}
      {isModalOpen && <AddContactModal onClose={closeModal} />}
      <Outlet />
    </div>
  );
}
