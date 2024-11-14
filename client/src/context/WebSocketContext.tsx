import React, { createContext, useContext, useEffect, useState } from "react";

const WebSocketContext = createContext<WebSocket | null>(null);

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (!ws) {
      console.log("Создаём новое WebSocket соединение КОНТЕКСТ");
      const socket = new WebSocket("ws://localhost:3000");

      socket.onopen = () => {
        console.log("WebSocket соединение установлено КОНТЕКСТ");
      };

      socket.onerror = (error) => {
        console.error("Ошибка WebSocket:", error);
      };

      socket.onclose = () => {
        console.log("WebSocket соединение закрыто");
      };

      setWs(socket);
    }

    return () => {
      console.log(
        "WebSocketProvider размонтируется, но соединение не закрывается",
      );
    };
  }, [ws]);

  return (
    <WebSocketContext.Provider value={ws}>{children}</WebSocketContext.Provider>
  );
};
