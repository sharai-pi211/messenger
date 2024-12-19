import React, { useState, useEffect } from "react";
import { Form, useParams } from "react-router-dom";
import "../styles/Contact.css";

interface Contact {
  _id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  status: string;
  lastActive?: string;
}

export default function Contact() {
  const { contactId } = useParams<{ contactId: string }>();
  const [contact, setContact] = useState<Contact | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch contact information
  useEffect(() => {
    const fetchContact = async () => {
      if (!contactId) return;

      try {
        const response = await fetch(`http://localhost:3000/api/users/${contactId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch contact");
        }

        const data = await response.json();
        setContact(data);
      } catch (error) {
        console.error("Ошибка при получении пользователя:", error);
        setError("Ошибка при загрузке информации о контакте");
      }
    };

    fetchContact();
  }, [contactId]);

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!contact) {
    return <div className="loading">Loading contact...</div>;
  }

  return (
    <div id="contact" className="contact">
      <div className="contact-header">
        <img
          src={
            contact.avatarUrl ||
            `https://robohash.org/${contact._id}.png?size=200x200`
          }
          alt={contact.username}
          className="contact-avatar"
        />
        <div className="contact-info">
          <h1>{contact.username}</h1>
          <p>Email: {contact.email}</p>
          <p>Status: {contact.status}</p>
          {contact.lastActive && (
            <p>Last Active: {new Date(contact.lastActive).toLocaleString()}</p>
          )}
        </div>
      </div>

      <div className="contact-actions">
        <Form action="edit">
          <button type="submit" className="edit-button">
            Edit
          </button>
        </Form>
        <Form method="post" action="destroy">
          <button type="submit" className="delete-button">
            Delete
          </button>
        </Form>
      </div>
    </div>
  );
}
