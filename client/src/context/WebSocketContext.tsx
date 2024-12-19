import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

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
        const message = JSON.parse(event.data);
        if (message.event === "userStatus") {
          console.log("Статус пользователей был запрошен устала миллиард таскать");
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
        console.log("userOffline", userId);
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
