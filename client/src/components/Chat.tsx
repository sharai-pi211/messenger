import "../styles/Chat.css";
import { useWebSocket } from "../context/WebSocketContext";
import { useParams, useLocation } from "react-router-dom";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useRef, useState } from "react";

interface Reaction {
  emoji: string;
  userId: string;
}

interface Message {
  _id: string;
  content: string;
  sender: {
    _id?: string;
    id?: string;
    username: string;
  };
  timestamp: string;
  type: string;
  media_URL?: string;
  reactions?: Reaction[];
}

const reactionOptions = [
  "👍",
  "❤️",
  "😂",
  "🎉",
  "😢",
  "😡",
  "👏",
  "🔥",
  "💯",
  "⭐",
];

export default function Chat() {
  const { chatId } = useParams<{ chatId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username");
  const location = useLocation();
  const chatPartner = location.state?.chatPartnerName || "Собеседник";
  const ws = useWebSocket();
  const MAX_FILE_SIZE_MB = 1;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeReactionMenu, setActiveReactionMenu] = useState<string | null>(
    null
  );

  const toggleReactionMenu = (messageId: string) => {
    setActiveReactionMenu((prev) =>
      prev === messageId ? null : messageId
    );
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          event: "addReaction",
          data: { messageId, emoji, userId },
        })
      );
    }
    console.log({ messageId, emoji, userId });
  };

  const handleRemoveReaction = (messageId: string, emoji: string) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          event: "removeReaction",
          data: { messageId, emoji, userId },
        })
      );
    }
  };

  const handleReactionToggle = (messageId: string, emoji: string) => {
    const message = messages.find((msg) => msg._id === messageId);

    if (!message) return;

    const existingReaction = message.reactions?.find(
      (reaction) => reaction.emoji === emoji && reaction.userId === userId
    );

    if (existingReaction) {
      handleRemoveReaction(messageId, emoji);
      console.log("удаляю");
    } else {
      handleAddReaction(messageId, emoji);
      console.log("добавляю");
    }
  };

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (transcript) {
      setNewMessage(transcript);
    }
  }, [transcript]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleVoiceInput = () => {
    if (!browserSupportsSpeechRecognition) {
      alert("Ваш браузер не поддерживает голосовой ввод.");
      return;
    }

    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      SpeechRecognition.startListening({ continuous: true, language: "ru-RU" });
    }
  };

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
          alert(
            `Файл "${file.name}" слишком большой (${fileSizeMB.toFixed(2)} МБ). Максимальный размер: ${MAX_FILE_SIZE_MB} МБ.`
          );
          continue;
        }

        totalSize += file.size;
        if (totalSize / (1024 * 1024) > MAX_FILE_SIZE_MB) {
          alert(
            `Превышен общий лимит загрузки файлов (${(totalSize / (1024 * 1024)).toFixed(2)} МБ). Максимальный общий размер: ${MAX_FILE_SIZE_MB} МБ.`
          );
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
          } else if (
            response.event === "reactionAdded" ||
            response.event === "reactionRemoved"
          ) {
            const updatedMessage = response.data;
            console.log(updatedMessage);

            setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                msg._id === updatedMessage._id
                  ? {
                      ...msg,
                      reactions: updatedMessage.reactions.filter(
                        (reaction: Reaction, index: number, self: Reaction[]) =>
                          index ===
                          self.findIndex(
                            (r: Reaction) =>
                              r.emoji === reaction.emoji &&
                              r.userId === reaction.userId
                          )
                      ),
                    }
                  : msg
              )
            );
          }
        } catch (error) {
          console.error("Ошибка при парсинге сообщения:", error);
        }
      };
    }
  }, [chatId, ws]);

  const handleSendMessage = () => {
    if (!newMessage.trim() && selectedFiles.length === 0) return;

    if (listening) {
      SpeechRecognition.stopListening();
    }

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
            sender: {
              _id: userId,
            },
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
          sender: {
            _id: userId,
            username: username,
          },
          type: "text",
          content: newMessage,
        },
      };

      console.log(messageData);
      ws?.send(JSON.stringify(messageData));
      setNewMessage("");
      resetTranscript();
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
            key={message._id}
            className={`message-item ${
              message.sender._id === userId || message.sender.id === userId
                ? "message-right"
                : "message-left"
            } `}
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
              <img
                src={message.content}
                alt="Изображение"
                className="message-image"
              />
            ) : (
              <p>{message.content}</p>
            )}

            {/* <div className="reactions-container">
              {reactionOptions.map((emoji) => (
                <button
                  key={emoji}
                  className={`reaction-button ${
                    message.reactions?.some(
                      (reaction) =>
                        reaction.emoji === emoji && reaction.userId === userId
                    )
                      ? "reaction-blue" // Если текущий пользователь поставил реакцию
                      : message.reactions?.some(
                            (reaction) => reaction.emoji === emoji
                          )
                        ? "reaction-gray" // Если реакция есть, но её поставил другой пользователь
                        : ""
                  }`}
                  onClick={() => handleReactionToggle(message._id, emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div> */}

{/* <div className="reactions-container">
      <button
        className="toggle-reactions-button"
        onClick={() => toggleReactionMenu(message._id)}
      >
        😊 
      </button>

      <div className="active-reactions">
        {message.reactions?.map((reaction, index) => (
          <span
            key={index}
            className={`reaction ${
              reaction.userId === userId ? "reaction-blue" : "reaction-gray"
            }`}
          >
            {reaction.emoji}
          </span>
        ))}
      </div>

      {activeReactionMenu === message._id && (
        <div className="reaction-menu">
          {reactionOptions.map((emoji) => (
            <button
              key={emoji}
              className={`reaction-button ${
                message.reactions?.some(
                  (reaction) =>
                    reaction.emoji === emoji && reaction.userId === userId
                )
                  ? "reaction-blue"
                  : ""
              }`}
              onClick={() => handleReactionToggle(message._id, emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div> */}

{/* <div className="reactions-container">
  <button
    className="toggle-reactions-button"
    onClick={() => toggleReactionMenu(message._id)}
  >
    😊 
  </button>

  <div className="active-reactions">
    {reactionOptions.map((emoji) => {
      // Фильтруем реакции для данного эмодзи
      const relevantReactions = message.reactions?.filter(
        (reaction) => reaction.emoji === emoji
      );

      if (!relevantReactions || relevantReactions.length === 0) {
        return null; // Если реакций для эмодзи нет, ничего не рендерим
      }

      const isUserReaction = relevantReactions.some(
        (reaction) => reaction.userId === userId
      );

      return (
        <button
          key={emoji}
          className={`reaction ${isUserReaction ? "reaction-blue" : "reaction-gray"}`}
          onClick={() => handleReactionToggle(message._id, emoji)} // Нажатие на реакцию
        >
          {emoji} <span className="reaction-count">{relevantReactions.length}</span>
        </button>
      );
    })}
  </div>

  {activeReactionMenu === message._id && (
    <div className="reaction-menu">
      {reactionOptions.map((emoji) => (
        <button
          key={emoji}
          className={`reaction-button ${
            message.reactions?.some(
              (reaction) =>
                reaction.emoji === emoji && reaction.userId === userId
            )
              ? "reaction-blue"
              : ""
          }`}
          onClick={() => handleReactionToggle(message._id, emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
  )}
</div> */}

<div className="reactions-container">
  {/* Кнопка для переключения показа меню реакций */}
  <button
    className="toggle-reactions-button"
    onClick={() => toggleReactionMenu(message._id)}
  >
                  <img
                src={ "/reaction.svg"}
                alt={"Reaction"}
                className="reaction-icon"
              />
  </button>

  {/* Отображение поставленных реакций с количеством */}
  <div className="active-reactions">
    {reactionOptions.map((emoji) => {
      // Фильтруем реакции для данного эмодзи
      const relevantReactions = message.reactions?.filter(
        (reaction) => reaction.emoji === emoji
      );

      if (!relevantReactions || relevantReactions.length === 0) {
        return null; // Если реакций для эмодзи нет, ничего не рендерим
      }

      const isUserReaction = relevantReactions.some(
        (reaction) => reaction.userId === userId
      );

      return (
        <button
          key={emoji}
          className={`reaction ${isUserReaction ? "reaction-blue" : "reaction-gray"}`}
          onClick={() => handleReactionToggle(message._id, emoji)} // Нажатие на реакцию
        >
          {emoji}{" "}
          {relevantReactions.length > 1 && (
            <span className="reaction-count">{relevantReactions.length}</span>
          )}
        </button>
      );
    })}
  </div>

  {/* Меню доступных реакций, показывается при включении */}
  {activeReactionMenu === message._id && (
    <div className="reaction-menu">
      {reactionOptions.map((emoji) => (
        <button
          key={emoji}
          className={`reaction-button ${
            message.reactions?.some(
              (reaction) =>
                reaction.emoji === emoji && reaction.userId === userId
            )
              ? "reaction-blue"
              : ""
          }`}
          onClick={() => handleReactionToggle(message._id, emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
  )}
</div>

            
            <span>{new Date(message.timestamp).toLocaleString()}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-cont">
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

          <div className="buttons-cont">
            <div
              className="file-attachment-container"
              onClick={() => fileInputRef.current?.click()}
            >
              <img
                src="/clip.svg"
                alt="Прикрепить файл"
                className="file-attachment-icon"
              />
              {selectedFiles.length > 0 && (
                <div className="file-attachment-indicator">
                  {selectedFiles.length}
                </div>
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

            <button
              className={`mic file-attachment-container ${listening ? "listening" : ""}`}
              onClick={handleVoiceInput}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage();
                  SpeechRecognition.stopListening();
                }
              }}
            >
              <img
                src={listening ? "/mic-f.svg" : "/mic.svg"}
                alt={listening ? "Микрофон включен" : "Микрофон выключен"}
                className="file-attachment-icon mic-icon"
              />
            </button>

            <button className="m-send" onClick={handleSendMessage}>
              <img src={"/send.svg"} alt={"Отправить"} className="send-icon" />
            </button>
          </div>
        </div>
        {selectedFiles.length > 0 && (
          <div className="preview-container">
            {selectedFiles.map((file, index) => (
              <div key={index} className="image-preview-container">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`preview-${index}`}
                  className="image-preview"
                />
                <button
                  className="remove-button"
                  onClick={() => handleRemoveFile(index)}
                >
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
