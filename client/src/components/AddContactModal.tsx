// import { useState, useEffect } from "react";
// import "../styles/AddContactModal.css";
// import { useWebSocket } from "../context/WebSocketContext";


// interface Contact {
//   userId: string;
//   username: string;
//   status: string;
//   avatarUrl?: string;
//   lastActive: string;
// }

// interface AddContactModalProps {
//   onClose: () => void;
// }

// export default function AddContactModal({ onClose }: AddContactModalProps) {
//   const currentUser = localStorage.getItem("userId");
//   const [contacts, setContacts] = useState<Contact[]>([]);
//   const [searchQuery, setSearchQuery] = useState<string>("");
//     const ws = useWebSocket();
  

//   const fetchContacts = async () => {
//     try {
//       const response = await fetch("http://localhost:3000/api/users"); 
//       const data = await response.json();
//       setContacts(data);
//     } catch (error) {
//       console.error("Ошибка при получении пользователей:", error);
//     }
//   };

//   const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchQuery(e.target.value.toLowerCase());
//   };

//   const handleSendMessage = (userId: string) => {
//     console.log(`Отправка сообщения пользователю с ID: ${userId}`);
//     // Здесь можно добавить логику для открытия чата или отправки сообщения
//   };

//   const handleSendFriendRequest = (userId: string) => {
//     if (ws && ws.readyState === WebSocket.OPEN) {
//       ws.send(
//         JSON.stringify({ event: "sendFriendRequest", data: { userId: currentUser, friendId: userId } })
//       );
//       console.log("Запрос в друзья отправлен через WebSocket пользователю:", userId);
//     } else {
//       console.error("WebSocket не подключен.");
//       console.log("Не удалось отправить запрос в друзья. WebSocket не подключен.");
//     }
//   };

//   const filteredContacts = contacts.filter((contact) =>
//     contact.username.toLowerCase().includes(searchQuery),
//   );

//   useEffect(() => {
//     fetchContacts();
//   }, []);

//   return (
//     <div className="modal">
//       <div className="modal-content">
//         <button className="close-button" onClick={onClose}>
//           &times;
//         </button>
//         <h2>Add Contact</h2>
//         <input
//           type="text"
//           placeholder="Search user..."
//           value={searchQuery}
//           onChange={handleSearch}
//         />
//         <div className="modal-contacts-list">
//           {filteredContacts.map((contact) => (
//             <div key={contact.userId} className="modal-contact-item">
//               <div className="avatar">
//                 {contact.avatarUrl ? (
//                   <img src={contact.avatarUrl} alt={contact.username} />
//                 ) : (
//                   <div className="default-avatar">
//                     {contact.username.charAt(0)}
//                   </div>
//                 )}
//                 <span
//                   className={`status-indicator ${
//                     contact.status === "online" ? "online" : "offline"
//                   }`}
//                 ></span>
//               </div>
//               <div className="contact-info">
//                 <p className="contact-name">{contact.username}</p>
//               </div>
//               <div className="contact-actions">
//                 <button
//                   className="send-message-button"
//                   onClick={() => handleSendMessage(contact.userId)}
//                 >
//                   Отправить сообщение
//                 </button>
//                 <button
//                   className="send-request-button"
//                   onClick={() => handleSendFriendRequest(contact.userId)}
//                 >
//                   Отправить запрос в друзья
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }


// import { useState, useEffect } from "react";
// import "../styles/AddContactModal.css";
// import { useWebSocket } from "../context/WebSocketContext";

// interface Contact {
//   userId: string;
//   username: string;
//   status: string;
//   avatarUrl?: string;
//   lastActive: string;
// }

// interface AddContactModalProps {
//   onClose: () => void;
// }

// export default function AddContactModal({ onClose }: AddContactModalProps) {
//   const currentUser = localStorage.getItem("userId");
//   const [contacts, setContacts] = useState<Contact[]>([]);
//   const [searchQuery, setSearchQuery] = useState<string>("");
//   const ws = useWebSocket();

//   const fetchContacts = async () => {
//     try {
//       const userId = localStorage.getItem("userId");

//       if (!userId) {
//         console.error("User ID отсутствует. Не удаётся выполнить запрос.");
//         return;
//       }
//       console.log(userId);
      
//       const response = await fetch("http://localhost:3000/api/users", {
//         method: "POST", // Используем POST, чтобы передать данные через body
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ currentUserId: userId }), // Передаем userId через тело запроса
//       });


//       const data = await response.json();
      
      
//       console.log(data);
//     } catch (error) {
//       console.error("Ошибка при получении пользователей:", error);
//     }
//   };

//   const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchQuery(e.target.value.toLowerCase());
//   };

//   const handleSendMessage = (userId: string) => {
//     console.log(`Отправка сообщения пользователю с ID: ${userId}`);
//     // Здесь можно добавить логику для открытия чата или отправки сообщения
//   };

//   const handleSendFriendRequest = (userId: string) => {
//     if (ws && ws.readyState === WebSocket.OPEN) {
//       ws.send(
//         JSON.stringify({
//           event: "sendFriendRequest",
//           data: { userId: currentUser, friendId: userId },
//         })
//       );
//       console.log("Запрос в друзья отправлен через WebSocket пользователю:", userId);
//     } else {
//       console.error("WebSocket не подключен.");
//     }
//   };

//   // Фильтруем контакты
//   const filteredContacts = contacts.filter(
//     (contact) =>
//       contact.userId !== currentUser && // Исключаем самого пользователя
//       contact.status !== "accepted" && // Исключаем тех, кто уже в друзьях
//       contact.status !== "pending" && // Исключаем тех, кому отправлены запросы
//       contact.username.toLowerCase().includes(searchQuery) // Фильтруем по имени
//   );

//   useEffect(() => {
//     fetchContacts();
//   }, []);

//   return (
//     <div className="modal">
//       <div className="modal-content">
//         <button className="close-button" onClick={onClose}>
//           &times;
//         </button>
//         <h2>Add Contact</h2>
//         <input
//           type="text"
//           placeholder="Search user..."
//           value={searchQuery}
//           onChange={handleSearch}
//         />
//         <div className="modal-contacts-list">
//           {filteredContacts.map((contact) => (
//             <div key={contact.userId} className="modal-contact-item">
//               <div className="avatar">
//                 {contact.avatarUrl ? (
//                   <img src={contact.avatarUrl} alt={contact.username} />
//                 ) : (
//                   <div className="default-avatar">
//                     {contact.username.charAt(0)}
//                   </div>
//                 )}
//                 <span
//                   className={`status-indicator ${
//                     contact.status === "online" ? "online" : "offline"
//                   }`}
//                 ></span>
//               </div>
//               <div className="contact-info">
//                 <p className="contact-name">{contact.username}</p>
//               </div>
//               <div className="contact-actions">
//                 <button
//                   className="send-message-button"
//                   onClick={() => handleSendMessage(contact.userId)}
//                 >
//                   Отправить сообщение
//                 </button>
//                 <button
//                   className="send-request-button"
//                   onClick={() => handleSendFriendRequest(contact.userId)}
//                 >
//                   Отправить запрос в друзья
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect } from "react";
import "../styles/AddContactModal.css";
import { useWebSocket } from "../context/WebSocketContext";

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

  // const handleSendFriendRequest = (userId: string) => {
  //   if (ws && ws.readyState === WebSocket.OPEN) {
  //     ws.send(
  //       JSON.stringify({
  //         event: "sendFriendRequest",
  //         data: { userId: currentUser, friendId: userId },
  //       })
  //     );
  //     console.log("Запрос в друзья отправлен через WebSocket пользователю:", userId);
  //   } else {
  //     console.error("WebSocket не подключен.");
  //   }
  // };

  // const handleCancelFriendRequest = (userId: string) => {
  //   if (ws && ws.readyState === WebSocket.OPEN) {
  //     ws.send(
  //       JSON.stringify({
  //         event: "cancelFriendRequest",
  //         data: { userId: currentUser, friendId: userId },
  //       })
  //     );
  //     console.log("Заявка в друзья отменена через WebSocket пользователю:", userId);
  //   } else {
  //     console.error("WebSocket не подключен.");
  //   }
  // };

  const handleSendFriendRequest = (userId: string) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          event: "sendFriendRequest",
          data: { userId: currentUser, friendId: userId },
        })
      );
      console.log("Запрос в друзья отправлен через WebSocket пользователю:", userId);
  
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
      console.log("Запрос в друзья отменен через WebSocket пользователю:", userId);
  
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
                    Add
                  </button>
                ) : contact.status === "pending" ? (
                  <button
                    className="cancel-request-button rb"
                    onClick={() => handleCancelFriendRequest(contact.userId)}
                  >
                    Cancel request
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
