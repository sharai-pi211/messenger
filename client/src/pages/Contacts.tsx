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
  const [friendRequests, setFriendRequests] = useState<Friend[]>([]);

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

        if (message.event === "friendRequestAccepted") {
          setFriendRequests((prevRequests) => {
            const updatedRequests = prevRequests.filter(
              (request) =>
                request?._id?.toString() !== message.requestorId?.toString()
            );
            console.log("Updated friendRequests:", updatedRequests);
            return updatedRequests;
          });

          setFriends((prevFriends) => {
            const updatedFriends = [
              ...prevFriends,
              {
                _id: message.requestorId,
                username: message.username || "Unknown User",
                avatarUrl: message.avatarUrl || "",
                status: "accepted",
                lastActive: message.lastActive || "",
              },
            ];
            console.log("Updated friends:", updatedFriends);
            return updatedFriends;
          });
        } else if (message.event === "getuserFriends") {
          console.log("getuserFriends", message);

          const formattedFriends = message.data
            .filter((friend: any) => friend.status === "accepted")
            .map((friend: any) => ({
              _id: friend.friendId._id,
              username: friend.friendId.username,
              avatarUrl: friend.friendId.avatarUrl,
              status: friend.status,
              lastActive: friend.friendId.lastActive,
            }));

          const friendRequests = message.data
            .filter((friend: any) => friend.status === "pending")
            .map((friend: any) => ({
              _id: friend.friendId._id,
              username: friend.friendId.username,
              avatarUrl: friend.friendId.avatarUrl,
              lastActive: friend.friendId.lastActive,
            }));

          setFriends([...formattedFriends]);
          console.log("Set friends:", formattedFriends);
          setFriendRequests([...friendRequests]);
          console.log("Set friendRequests:", friendRequests);
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
  }, [ws /*, friendRequests*/]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
  };

  const handleContactClick = (contactId: string) => {
    navigate(`/contacts/${contactId}`);
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
      console.log(`Заявка от пользователя ${requestorId} принята`);
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
      console.log(`Заявка от пользователя ${requestorId} отклонена`);
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
          <div className="contacts-section">
            <h2>Received Friend Requests</h2>
            {friendRequests.length > 0 ? (
              friendRequests.map((request) => (
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
                      className="accept-button"
                      onClick={() =>
                        handleAcceptFriendRequest(request._id || "")
                      }
                    >
                      Accept
                    </button>
                    <button
                      className="decline-button"
                      onClick={() =>
                        handleDeclineFriendRequest(request._id || "")
                      }
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No pending friend requests.</p> // Рендерим сообщение вместо списка
            )}
          </div>

          {/* Отправленные заявки */}
          <div className="contacts-section">
            <h2>Sent Friend Requests</h2>
            {friends
              .filter((friend) => friend.status === "pending")
              .map((friend) => (
                <div key={friend._id} className="contact-item">
                  <div className="avatar">
                    {friend.avatarUrl ? (
                      <img src={friend.avatarUrl} alt={friend.username} />
                    ) : (
                      <div className="default-avatar">
                        {friend.username.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="contact-info">
                    <p>{friend.username}</p>
                  </div>
                  <p className="status-pending">Request Sent</p>
                </div>
              ))}
          </div>

          {/* Контакты */}
          <div className="contacts-section">
            <h2>Contacts</h2>

            {friends.map((friend) => (
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
            ))}
          </div>
        </div>
      </div>

      {isModalOpen && <AddContactModal onClose={() => setIsModalOpen(false)} />}
      <Outlet />
    </div>
  );
}
