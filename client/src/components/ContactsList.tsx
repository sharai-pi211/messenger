import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import "../styles/ContactsList.css";
import Panel from "./Panel";
import formatLastActive from "../utils/formatLastActive";

interface Contact {
  userId: string;
  username: string;
  status: string;
  avatarUrl?: string;
  lastActive: string;
}

export default function ContactsList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalSearchQuery, setModalSearchQuery] = useState<string>("");

  const fetchContacts = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/users");
      const data = await response.json();
      console.log("Полученные данные:", data);
  
      const formattedData = data.map((contact: Contact) => ({
        userId: contact.userId,
        username: contact.username,
        status: contact.status,
        avatarUrl: contact.avatarUrl,
        lastActive: contact.lastActive,
      }));
  
      setContacts(formattedData);
      setFilteredContacts(formattedData);
      setLoading(false);
    } catch (error) {
      console.error("Ошибка при получении пользователей:", error);
      setLoading(false);
    }
  };
  

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = contacts.filter((contact) =>
      contact.username.toLowerCase().includes(query)
    );
    setFilteredContacts(filtered);
  };

  const handleModalSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setModalSearchQuery(query);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalSearchQuery("");
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const filteredModalContacts = contacts.filter((contact) =>
    contact.username.toLowerCase().includes(modalSearchQuery)
  );

  if (loading) {
    return <div>Загрузка контактов...</div>;
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
          {filteredContacts.map((contact, index) => (
            <div key={index} className="contact-item" id={`contact-${contact.userId}`}>
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
                {contact.status !== "online" && (
                  <p className="contact-last-active">
                    Last active: {formatLastActive(contact.lastActive)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Модальное окно */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-button" onClick={closeModal}>
              &times;
            </button>
            <h2>Add Contact</h2>
            <input
              type="text"
              placeholder="Search user..."
              value={modalSearchQuery}
              onChange={handleModalSearch}
            />
            <div className="modal-contacts-list">
              {filteredModalContacts.map((contact, index) => (
                <div key={index} className="modal-contact-item" id={`contact-${contact.userId}`}>
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <Outlet />
    </div>
  );
}
