// import { useEffect, useState } from "react";
// import { Outlet, useNavigate } from "react-router-dom";
// import "../styles/ContactsList.css";
// import formatLastActive from "../utils/formatLastActive";
// import { useWebSocket } from "../context/WebSocketContext";
// import Panel from "../components/Panel";
// import AddContactModal from "../components/AddContactModal";

// interface Chat {
//   chatId: string;
//   userId: string;
//   username: string;
//   status: string;
//   avatarUrl?: string;
//   lastActive: string;
// }

// export default function Contacts() {
//   const [chats, setChats] = useState<Chat[]>([]);
//   const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
//   const [searchQuery, setSearchQuery] = useState<string>("");
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
//   const navigate = useNavigate();
//   const ws = useWebSocket();

//   const fetchChats = () => {
//     const userId = localStorage.getItem("userId");

//     if (userId && ws && ws.readyState === WebSocket.OPEN) {
//       ws.send(JSON.stringify({ event: "getUserChats", data: userId }));
//     }
//   };

//   useEffect(() => {
//     if (!ws) {
//       return;
//     }
  
//     if (ws.readyState === WebSocket.OPEN) {
//       fetchChats();
//     } else {
//       ws.onopen = () => {
//         fetchChats();
//       };
//     }
  
//     ws.onmessage = (event) => {
//       try {
//         const message = JSON.parse(event.data);
  
//         if (message.event === "userChats") {
//           const formattedData = message.data.map((chat: any) => {
//             const userId = localStorage.getItem("userId");
//             const otherParticipant = chat.participants.find(
//               (participant: any) => participant._id !== userId,
//             );
  
//             return {
//               chatId: chat._id,
//               userId: otherParticipant._id,
//               username: otherParticipant.username,
//               status: otherParticipant.status,
//               avatarUrl: otherParticipant.avatarUrl,
//               lastActive: otherParticipant.lastActive || "",
//             };
//           });
  
//           setChats(formattedData);
//           setFilteredChats(formattedData);
//           setLoading(false);
//         } else if (message.event === "userStatus") {
//           console.log("Статус пользователей:", message.data);
//           const updatedChats = chats.map((chat) => {
//             const updatedUser = message.data.find((user: any) => user.userId === chat.userId);
//             if (updatedUser) {
//               return {
//                 ...chat,
//                 status: updatedUser.status,
//                 lastActive: updatedUser.lastActive,
//               };
//             }
//             return chat;
//           });
  
//           setChats(updatedChats);
//           setFilteredChats(updatedChats);
//         } else if (message.event === "error") {
//           setError(message.message);
//           setLoading(false);
//         }
//       } catch (error) {
//         console.error("Ошибка при обработке сообщения:", error);
//       }
//     };
  
//     return () => {
//       if (ws) {
//         ws.onopen = null;
//         ws.onmessage = null;
//       }
//     };
//   }, [ws, chats]);
  

//   const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const query = e.target.value.toLowerCase();
//     setSearchQuery(query);

//     const filtered = chats.filter((chat) =>
//       chat.username.toLowerCase().includes(query),
//     );
//     setFilteredChats(filtered);
//   };


//   return (
//     <div className="row">
//       <Panel />
//       <div className="contacts-container">
//         <div className="header">
//           <h1>Contacts</h1>
//           <button
//             className="add-contact-button"
//             onClick={() => setIsModalOpen(true)}
//           >
//             +
//           </button>
//         </div>
//         <div className="contacts-list">
//           <div className="search-bar">
//             <input
//               type="text"
//               placeholder="Search here..."
//               value={searchQuery}
//               onChange={handleSearch}
//             />
//           </div>
//           {filteredChats.map((chat) => (
//             <div
//               key={chat.chatId}
//               className="contact-item"
//               id={`contact-${chat.chatId}`}
//             >
//               <div className="avatar">
//                 {chat.avatarUrl ? (
//                   <img src={chat.avatarUrl} alt={chat.username} />
//                 ) : (
//                   <div className="default-avatar">
//                     {chat.username.charAt(0)}
//                   </div>
//                 )}
//                 <span
//                   className={`status-indicator ${chat.status === "online" ? "online" : "offline"}`}
//                 ></span>
//               </div>
//               <div className="contact-info">
//                 <p className="contact-name">{chat.username}</p>
//                 {chat.status !== "online" && (
//                   <p className="contact-last-active">
//                     Last active: {formatLastActive(chat.lastActive)}
//                   </p>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//       {isModalOpen && <AddContactModal onClose={() => setIsModalOpen(false)} />}
//       <Outlet />
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import "../styles/ContactsList.css";
import { useWebSocket } from "../context/WebSocketContext";
import Panel from "../components/Panel";
import AddContactModal from "../components/AddContactModal";
import formatLastActive from "../utils/formatLastActive";

interface Friend {
  _id: string;
  username: string;
  status: string;
  avatarUrl?: string;
  lastActive: string;
}

export default function Contacts() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const ws = useWebSocket();
  const navigate = useNavigate();
  

  // Функция получения друзей
  const fetchFriends = () => {
    const userId = localStorage.getItem("userId");

    if (userId && ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ event: "getUserFriends", data: { userId } }));
    }
  };

  useEffect(() => {
    if (!ws) return;

    if (ws.readyState === WebSocket.OPEN) {
      fetchFriends();
    } else {
      ws.onopen = fetchFriends;
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        // Обработка события получения списка друзей
        if (message.event === "getuserFriends") {
            console.log("getuserFriends",message);
         /* setFriends(message.data);
          setFilteredFriends(message.data);
          console.log("setFriends",friends);
          setLoading(false);*/

                  // Преобразуем данные в нужный формат
                  const formattedFriends = message.data.map((friend: typeof message.data[0]) => ({
                    _id: friend.friendId._id,
                    username: friend.friendId.username,
                    avatarUrl: friend.friendId.avatarUrl,
                    status: friend.friendId.status,
                    lastActive: friend.friendId.lastActive
                  }));
  
          setFriends(formattedFriends);
          setFilteredFriends(formattedFriends);
          console.log("setFriends", friends);
          setLoading(false);

        } else if (message.event === "error") {
          setError(message.message);
          setLoading(false);
        }
      } catch (error) {
        console.error("Ошибка при обработке сообщения:", error);
      }
    };

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

    const filtered = friends.filter((friend) =>
      friend.username.toLowerCase().includes(query),
    );
    setFilteredFriends(filtered);
    console.log(filteredFriends);
  };

  const handleContactClick = (contactId: string) => {
    console.log(`Нажат бзер ${contactId}`);
    navigate(`/contacts/${contactId}`);
  };

  return (
    <div className="row">
      <Panel />
      <div className="contacts-container">
        <div className="header">
          <h1>Contacts</h1>
          <button
            className="add-contact-button"
            onClick={() => setIsModalOpen(true)}
          >
            +
          </button>
        </div>
        <div className="contacts-list">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          {loading ? (
            <p>Loading friends...</p>
          ) : error ? (
            <p>Error: {error}</p>
          ) : friends.length > 0 ? (
            friends.map((friend) => (
              <div
                key={friend._id}
                className="contact-item"
                id={`contact-${friend._id}`}
                onClick={() => handleContactClick(friend._id)}
              >
                <div className="avatar">
                  {friend.avatarUrl ? (
                    <img src={friend.avatarUrl} alt={friend.username} />
                  ) : (
                    <div className="default-avatar">
                      {friend.username.charAt(0)}
                    </div>
                  )}
                  <span
                    className={`status-indicator ${
                      friend.status === "online" ? "online" : "offline"
                    }`}
                  ></span>
                </div>
                <div className="contact-info">
                  <p className="contact-name">{friend.username}</p>
                  {friend.status !== "online" && (
                    <p className="contact-last-active">
                      {formatLastActive(friend.lastActive)}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No friends found</p>
          )}
        </div>
      </div>
      {isModalOpen && <AddContactModal onClose={() => setIsModalOpen(false)} />}
      <Outlet />
    </div>
  );
}
