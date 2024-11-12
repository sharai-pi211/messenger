// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import "../styles/Chat.css";

// interface Message {
//   messageId: string;
//   senderId: string;
//   text: string;
//   timestamp: string;
// }

// export default function Chat() {
//   const { chatId } = useParams<{ chatId: string }>();
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [newMessage, setNewMessage] = useState<string>("");

//   useEffect(() => {
//     if (chatId) {
//       console.log(`Открыт чат с ID: ${chatId}`);
//       // Здесь вы можете отправить запрос на получение сообщений чата
//       // Пример:
//       // fetchMessages(chatId);
//     }
//   }, [chatId]);

//   const handleSendMessage = () => {
//     if (newMessage.trim() !== "") {
//       console.log(`Отправка сообщения: ${newMessage}`);
//       // Логика отправки сообщения через WebSocket или HTTP запрос
//       setNewMessage("");
//     }
//   };

//   return (
//     <div className="chat-container">
//         <div className="chat-header">
//         <h2>Чат {chatId}</h2>
//         </div>
//       <div className="messages-list">
//         {messages.map((message) => (
//           <div key={message.messageId} className="message-item">
//             <p>{message.text}</p>
//             <span>{message.timestamp}</span>
//           </div>
//         ))}
//       </div>
//       <div className="message-input">
//         <input
//           type="text"
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)}
//           placeholder="Введите сообщение..."
//         />
//         <button onClick={handleSendMessage}>Отправить</button>
//       </div>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface Message {
  messageId: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export default function Chat() {
  const { chatId } = useParams<{ chatId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");

  useEffect(() => {
    if (chatId) {
      console.log(`Открыт чат с ID: ${chatId}`);
    //   fetchChatMessages(chatId);
    }
  }, [chatId]);

  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      console.log(`Отправка сообщения: ${newMessage}`);
      // Логика отправки сообщения через WebSocket
      setNewMessage("");
    }
  };

  return (
    <div className="chat-container">
      <h2>Чат {chatId}</h2>
      <div className="messages-list">
        {messages.map((message) => (
          <div key={message.messageId} className="message-item">
            <p>{message.text}</p>
            <span>{message.timestamp}</span>
          </div>
        ))}
      </div>
      <div className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Введите сообщение..."
        />
        <button onClick={handleSendMessage}>Отправить</button>
      </div>
    </div>
  );
}
