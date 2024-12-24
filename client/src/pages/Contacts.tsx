import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import "../styles/ContactsList.css";
import { useWebSocket } from "../context/WebSocketContext";
import Panel from "../components/Panel";
import AddContactModal from "../components/AddContactModal";
import formatLastActive from "../utils/formatLastActive";
import { getSentRequests } from "../context/sentRequests";

interface Friend {
  _id: string;
  username: string;
  status: string;
  avatarUrl?: string;
  lastActive: string;
  friendId?: {
    _id: string;
    username: string;
    avatarUrl?: string;
    lastActive: string;
  };
}

export default function Contacts() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<Friend[]>([]);
  const [sentRequests, setSentRequests] = useState<Friend[]>([]);

  const ws = useWebSocket();
  const navigate = useNavigate();

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

        if (message.event === "getuserFriends") {

          const received = message.data
            .filter(
              (friend: any) =>
                friend.status === "pending" &&
                !getSentRequests().includes(friend.friendId?._id)
            )
            .map((friend: any) => ({
              _id: friend.friendId?._id,
              username: friend.friendId?.username,
              avatarUrl: friend.friendId?.avatarUrl,
              lastActive: friend.friendId?.lastActive,
            }));

          const sent = message.data
            .filter(
              (friend: any) =>
                friend.status === "pending" &&
                getSentRequests().includes(friend.friendId?._id)
            )
            .map((friend: any) => ({
              _id: friend.friendId?._id,
              username: friend.friendId?.username,
              avatarUrl: friend.friendId?.avatarUrl,
              lastActive: friend.friendId?.lastActive,
            }));

          const formattedFriends = message.data
            .filter((friend: any) => friend.status === "accepted")
            .map((friend: any) => ({
              _id: friend.friendId?._id,
              username: friend.friendId?.username,
              avatarUrl: friend.friendId?.avatarUrl,
              status: friend.status,
              lastActive: friend.friendId?.lastActive,
            }));

          setFriends([...formattedFriends]);
          setReceivedRequests([...received]);
          setSentRequests([...sent]);
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
  // }, [ws]);
   }, [ws, receivedRequests, sentRequests]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
  };

  const handleContactClick = (contactId: string) => {
    navigate(`/contacts/${contactId}`);
  };

  const handleCancelFriendRequest = (friendId: string) => {
    const userId = localStorage.getItem("userId");

    if (ws && ws.readyState === WebSocket.OPEN) {
      // Отправляем событие на сервер
      ws.send(
        JSON.stringify({
          event: "cancelFriendRequest",
          data: { userId: userId, friendId },
        })
      );


      // Удаляем запрос из локального состояния
      setSentRequests((prevRequests) =>
        prevRequests.filter((request) => request._id !== friendId)
      );

      // Опционально: уведомление пользователя
    } else {
      console.error("WebSocket is not connected.");
    }
  };

  const handleAcceptFriendRequest = (requestorId: string) => {
    const userId = localStorage.getItem("userId");

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          event: "acceptFriendRequest",
          data: { userId, requestorId },
        })
      );
    } else {
      console.error("WebSocket не подключен.");
    }
  };

  const handleDeclineFriendRequest = (requestorId: string) => {
    const userId = localStorage.getItem("userId");

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          event: "rejectFriendRequest",
          data: { userId, requestorId },
        })
      );
    } else {
      console.error("WebSocket не подключен.");
    }
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
          {/* Полученные заявки */}
          <div className="contacts-section">
            <h2>Received Friend Requests</h2>
            {receivedRequests.length > 0 ? (
              receivedRequests.map((request) => (
                <div key={request._id} className="contact-item">
                  <div className="avatar">
                    {request.avatarUrl ? (
                      <img
                        src={request.avatarUrl}
                        alt={request.username || "User"}
                      />
                    ) : (
                      <div className="default-avatar">
                        {request.username?.charAt(0) || "?"}
                      </div>
                    )}
                  </div>
                  <div className="contact-info">
                    <p>{request.username || "Unknown User"}</p>
                  </div>
                  <div className="contact-actions">
                    <button
                      className="accept-button cancel-request-button"
                      onClick={() => handleAcceptFriendRequest(request._id)}
                    >
                      <img
                        src={"/yes.svg"}
                        alt={"Cancel request"}
                        className="action-icon"
                      />
                    </button>
                    <button
                      className="decline-button cancel-request-button"
                      onClick={() => handleDeclineFriendRequest(request._id)}
                    >
                      <img
                        src={"/no.svg"}
                        alt={"Cancel request"}
                        className="action-icon"
                      />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No pending friend requests.</p>
            )}
          </div>

          {/* Отправленные заявки
          <div className="contacts-section">
            <h2>Sent Friend Requests</h2>
            {sentRequests.length > 0 ? (
              sentRequests.map((request) => (
                <div key={request._id} className="contact-item">
                  <div className="avatar">
                    {request.avatarUrl ? (
                      <img src={request.avatarUrl} alt={request.username} />
                    ) : (
                      <div className="default-avatar">
                        {request.username?.charAt(0) || "?"}
                      </div>
                    )}
                  </div>
                  <div className="contact-info">
                    <p>{request.username}</p>
                  </div>
                  <p className="status-pending">Request Sent</p>
                </div>
              ))
            ) : (
              <p>No sent friend requests.</p>
            )}
          </div> */}

          {/* Отправленные заявки */}
          <div className="contacts-section">
            <h2>Sent Friend Requests</h2>
            {sentRequests.length > 0 ? (
              sentRequests.map((request) => (
                <div key={request._id} className="contact-item">
                  <div className="avatar">
                    {request.avatarUrl ? (
                      <img src={request.avatarUrl} alt={request.username} />
                    ) : (
                      <div className="default-avatar">
                        {request.username?.charAt(0) || "?"}
                      </div>
                    )}
                  </div>
                  <div className="contact-info">
                    <p>{request.username}</p>
                  </div>
                  <div className="contact-actions">
                    <button
                      className="cancel-request-button"
                      onClick={() => handleCancelFriendRequest(request._id)}
                    >
                      <img
                        src={"/no.svg"}
                        alt={"Cancel request"}
                        className="action-icon"
                      />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No sent friend requests.</p>
            )}
          </div>

          {/* Контакты */}
          <div className="contacts-section">
            <h2>Contacts</h2>
            {friends.length > 0 ? (
              friends.map((friend) => (
                <div
                  key={friend._id}
                  className="contact-item"
                  onClick={() => handleContactClick(friend._id)}
                >
                  <div className="avatar">
                    {friend.avatarUrl ? (
                      <img
                        src={friend.avatarUrl}
                        alt={friend.username || "User"}
                      />
                    ) : (
                      <div className="default-avatar">
                        {friend.username?.charAt(0) || "?"}
                      </div>
                    )}
                  </div>
                  <div className="contact-info">
                    <p>{friend.username || "Unknown User"}</p>
                    {friend.lastActive && (
                      <p>Last Active: {formatLastActive(friend.lastActive)}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>No contacts found.</p>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && <AddContactModal onClose={() => setIsModalOpen(false)} />}
      <Outlet />
    </div>
  );
}
