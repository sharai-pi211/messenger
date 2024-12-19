import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Main from "./pages/Main";
import ChatsList from "./components/ChatsList";
import Chat from "./components/Chat";
import { WebSocketProvider } from "./context/WebSocketContext";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./context/PrivateRoute";
import Me from "./pages/Me";
import Contacts from "./pages/Contacts";
import Contact from "./components/Contact";
import { ToastContainer } from "react-toastify";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
  },
  {
    path: "/chats",
    element: (
      <PrivateRoute>
        <ChatsList />
      </PrivateRoute>
    ),
    children: [
      {
        path: ":chatId",
        element: (
          <PrivateRoute>
            <Chat />
          </PrivateRoute>
        ),
      },
    ],
  },
  {
    path: "/sign-in",
    element: <SignIn />,
  },
  {
    path: "/sign-up",
    element: <SignUp />,
  },
  {
    path: "/me",
    element: (
      <PrivateRoute>
        <Me />
      </PrivateRoute>
    ),
  },
  {
    path: "/contacts",
    element: (
      <PrivateRoute>
        <Contacts />
      </PrivateRoute>
    ),
    children: [
      {
        path: ":contactId",
        element: (
          <PrivateRoute>
            <Contact />
          </PrivateRoute>
        ),
      },
    ],
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

root.render(
  // <React.StrictMode>
    <AuthProvider>
      <WebSocketProvider>
      <ToastContainer />
        <RouterProvider router={router} />
      </WebSocketProvider>
    </AuthProvider>
  // </React.StrictMode>,
);

reportWebVitals();
