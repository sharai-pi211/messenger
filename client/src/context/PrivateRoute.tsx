import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface PrivateRouteProps {
  children: JSX.Element;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    console.log("Пользователь не авторизован. Перенаправляем на логин.");
  }

  return isAuthenticated ? children : <Navigate to="/sign-in" />;
};

export default PrivateRoute;
