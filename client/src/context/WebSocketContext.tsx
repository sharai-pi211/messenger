import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";

const WebSocketContext = createContext<WebSocket | null>(null);

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!ws && userId) {
      const socket = new WebSocket("ws://localhost:3000");

      socket.onopen = () => {
        socket.send(JSON.stringify({ event: "userOnline", data: { userId } }));
      };

      socket.onerror = (error) => {
        console.error("Ошибка WebSocket:", error);
      };

      socket.onclose = () => {
        console.log("WebSocket соединение закрыто");
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.event === "newMessage") {
            const currentUserId = localStorage.getItem("userId");
          
            // Check if the sender is not the current user
            // if (message.data.sender.id !== currentUserId) {
      
            //   const { sender, content } = message.data;
            //   toast.info(`${sender.username}: ${content[0]}`, {
            //     position: "bottom-right",
            //     autoClose: 10000,
            //     hideProgressBar: false,
            //     closeOnClick: true,
            //     pauseOnHover: true,
            //     draggable: true,
            //   });
            // }
            if (message.data.sender.id !== currentUserId) {
              const { sender, content } = message.data;
            
              // Проверяем, начинается ли контент с "data"
              const isImage = content[0]?.startsWith("data");
            
              toast.info(`${sender.username}: ${isImage ? "image" : content[0]}`, {
                position: "bottom-right",
                autoClose: 10000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              });
            }
            
          }
          
          if (message.event === "userStatus") {
            console.log("Статус пользователей обновлен");
          }
        } catch (error) {
          console.error("Ошибка обработки сообщения WebSocket:", error);
        }
      };

      setWs(socket);
      wsRef.current = socket;
    }

    return () => {

      if (
        wsRef.current &&
        wsRef.current.readyState === WebSocket.OPEN &&
        userId
      ) {
        wsRef.current.send(
          JSON.stringify({ event: "userOffline", data: { userId } })
        );
        wsRef.current.close();
      }
    };
  }, [ws, userId]);

  return (
    <WebSocketContext.Provider value={ws}>{children}</WebSocketContext.Provider>
  );
};
