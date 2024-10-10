import React from "react";
import { Form } from "react-router-dom";
import "../styles/Contact.css";

interface Contact {
  first: string;
  last: string;
  avatar: string;
  twitter?: string;
  notes?: string;
  favorite: boolean;
  id?: string;
}

export default function Contact() {
  const contact: Contact = {
    first: "Your",
    last: "Name",
    avatar: "https://robohash.org/you.png?size=200x200",
    notes: "Some notes",
    favorite: true,
  };

  return (
    <div id="contact" className="contact">
      <div>
        <img
          key={contact.avatar}
          src={
            contact.avatar ||
            `https://robohash.org/${contact.id}.png?size=200x200`
          }
          alt={`${contact.first} ${contact.last}`}
        />
      </div>

      <div>
        <h1>
          {contact.first || contact.last ? (
            <>
              {contact.first} {contact.last}
            </>
          ) : (
            <i>No Name</i>
          )}{" "}
        </h1>

        {contact.twitter && (
          <p>
            <a
              target="_blank"
              href={`https://twitter.com/${contact.twitter}`}
              rel="noopener noreferrer"
            >
              {contact.twitter}
            </a>
          </p>
        )}

        {contact.notes && <p>{contact.notes}</p>}

        <div>
          <Form action="edit">
            <button type="submit">Edit</button>
          </Form>
          <Form method="post" action="destroy">
            <button type="submit">Delete</button>
          </Form>
        </div>
      </div>
    </div>
  );
}
