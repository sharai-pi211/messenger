import { useState, useEffect } from "react";
import "../styles/AddContactModal.css";

interface Contact {
  userId: string;
  username: string;
  status: string;
  avatarUrl?: string;
  lastActive: string;
}

interface AddContactModalProps {
  onClose: () => void;
}

export default function AddContactModal({ onClose }: AddContactModalProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchContacts = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/users");
      const data = await response.json();
      setContacts(data);
    } catch (error) {
      console.error("Ошибка при получении пользователей:", error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.username.toLowerCase().includes(searchQuery),
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
