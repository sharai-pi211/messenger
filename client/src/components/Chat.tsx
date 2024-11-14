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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const userId = localStorage.getItem("userId");
  const location = useLocation();
  const chatPartner = location.state?.chatPartnerName || "Собеседник";
  const ws = useWebSocket();
  const MAX_FILE_SIZE_MB = 1;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles: File[] = [];
    let totalSize = selectedFiles.reduce((acc, file) => acc + file.size, 0);
  
    const resizeImage = (file: File): Promise<File> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const MAX_WIDTH = 800;
            const scale = MAX_WIDTH / img.width;
  
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scale;
  
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
              const resizedFile = new File([blob!], file.name, {
                type: file.type,
              });
              resolve(resizedFile);
            }, file.type);
          };
        };
        reader.readAsDataURL(file);
      });
    };
  
    const processFiles = async () => {
      for (const file of files) {
        const fileSizeMB = file.size / (1024 * 1024);
  
        if (fileSizeMB > MAX_FILE_SIZE_MB) {
          alert(`Файл "${file.name}" слишком большой (${fileSizeMB.toFixed(2)} МБ). Максимальный размер: ${MAX_FILE_SIZE_MB} МБ.`);
          continue;
        }
  
        totalSize += file.size;
        if (totalSize / (1024 * 1024) > MAX_FILE_SIZE_MB) {
          alert(`Превышен общий лимит загрузки файлов (${(totalSize / (1024 * 1024)).toFixed(2)} МБ). Максимальный общий размер: ${MAX_FILE_SIZE_MB} МБ.`);
          break;
        }
  
        const resizedFile = await resizeImage(file);
        newFiles.push(resizedFile);
      }
  
      setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
    };
  
    processFiles();
  };
  

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (chatId && ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ event: "getChatMessages", data: chatId }));
      console.log("getChatMessages");

      ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          if (response.event === "chatMessages") {
            setMessages(response.data || []);
            console.log(response.data);
          } else if (
            response.event === "newMessage" &&
            response.data.conversation_id === chatId
          ) {
            setMessages((prevMessages) => [...prevMessages, response.data]);
          }
        } catch (error) {
          console.error("Ошибка при парсинге сообщения:", error);
        }
      };
    }
  }, [chatId, ws]);

  const handleSendMessage = () => {
    if (!newMessage.trim() && selectedFiles.length === 0) return;

    if (selectedFiles.length > 0) {
      const readerPromises = selectedFiles.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readerPromises).then((base64Images) => {
        const messageData = {
          event: "createMessage",
          data: {
            chatId, 
            sender: userId,
            type: "image",
            content: base64Images,
          },
        };

        ws?.send(JSON.stringify(messageData));
        setSelectedFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      });
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
    <div
      key={message.messageId}
      className={`message-item ${message.sender === userId ? "message-right" : "message-left"}`}
    >
      {message.type === "image" && Array.isArray(message.content) ? (
        message.content.map((imageSrc, index) => (
          <img
            key={index}
            src={imageSrc}
            alt={`Изображение ${index + 1}`}
            className="message-image"
          />
        ))
      ) : message.type === "image" ? (
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

      <div className="file-attachment-container" onClick={() => fileInputRef.current?.click()}>
        <img src="/clip.svg" alt="Прикрепить файл" className="file-attachment-icon" />
        {selectedFiles.length > 0 && (
          <div className="file-attachment-indicator">{selectedFiles.length}</div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <button className="m-send" onClick={handleSendMessage}>
        ➜
      </button>

      {selectedFiles.length > 0 && (
        <div className="preview-container">
          {selectedFiles.map((file, index) => (
            <div key={index} className="image-preview-container">
              <img
                src={URL.createObjectURL(file)}
                alt={`preview-${index}`}
                className="image-preview"
              />
              <button className="remove-button" onClick={() => handleRemoveFile(index)}>
                ✖
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
