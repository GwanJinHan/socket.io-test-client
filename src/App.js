import React, { useEffect, useState } from "react";
import socketIOClient from "socket.io-client";

const socket = socketIOClient("https://falling-fire-8326.fly.dev/");

function App() {
  const [chatRooms, setChatRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [userId, setuserId] = useState("");

  useEffect(() => {
    // Fetch initial chatroom list
    socket.on("room list updated", (newRoom) => {
      setChatRooms((prevRooms) => [...prevRooms, newRoom]);
    });

    // Room created event
    socket.on("new room", (room) => {
      setCurrentRoom(room);
      setMessages(null);
    });

    // Room joined event
    socket.on("room joined", (room) => {
      setCurrentRoom(room);
      // axios GET 요청: roomId 로 채팅 불러오기
      setMessages(room.messages || []);
    });

    // Room left event
    socket.on("room left", () => {
      setCurrentRoom(null);
      setMessages(null);
    });

    // New message event
    socket.on("new message", (message) => {
      setMessages((prevMessages) =>
        prevMessages ? [...prevMessages, message] : [message]
      );
    });

    return () => {
      // Clean up event listeners
      socket.off("room list updated");
      socket.off("new room");
      socket.off("room joined");
      socket.off("room left");
      socket.off("new message");
    };
  }, []);

  const handleuserId = () => {
    const userId = prompt("Enter Your Name: ");
    setuserId(userId);
  };

  const handleCreateRoom = () => {
    // Prompt user for room data
    const locationalCode = prompt("locationalCode");
    const roomName = prompt("roomName");
    const maxMember = prompt("maxMember");
    const hostingMember = prompt("hostingMember");
    const currentMember = [hostingMember];
    const deliveryFee = prompt("deliveryFee");
    const restaurantName = prompt("restaurantName");
    const meetingTime = prompt("meetingTime");
    const roomId = Date.now().toString();
    const roomData = {
      roomId,
      locationalCode,
      roomName,
      maxMember,
      currentMember,
      hostingMember,
      deliveryFee,
      restaurantName,
      meetingTime,
    };

    socket.emit("create room", roomData);
  };

  const handleJoinRoom = (room) => {
    socket.emit("join room", room);
  };

  const handleLeaveRoom = () => {
    socket.emit("leave room", { roomId: currentRoom.roomId, userId });
  };

  const handleSendMessage = () => {
    if (inputMessage) {
      const messageData = {
        roomId: currentRoom.roomId,
        senderName: userId,
        senderId: userId,
        message: inputMessage,
      };
      socket.emit("send message", messageData);
      setInputMessage("");
    }
  };

  return (
    <div>
      <h1>Chat App</h1>
      <div>
        {userId === "" ? (
          <button onClick={handleuserId}>Set User Id</button>
        ) : (
          <h2>Hello! {userId}</h2>
        )}
      </div>
      {/* Create Room */}
      {!currentRoom && (
        <div>
          <button onClick={handleCreateRoom}>Create Room</button>
        </div>
      )}

      {/* Room List */}
      {chatRooms.length > 0 && (
        <div>
          <h2>Chatroom List</h2>
          <ul>
            {chatRooms.map((room) => (
              <li key={room.roomId}>
                <button onClick={() => handleJoinRoom(room)}>
                  {room.roomName}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Current Room */}
      {currentRoom && (
        <div>
          <h2>Current Room: {currentRoom.roomName}</h2>
          <button onClick={handleLeaveRoom}>Leave Room</button>

          {/* Chat Messages */}
          {messages !== null && (
            <div>
              <ul>
                {messages.map((message, index) => (
                  <li key={index}>
                    <strong>{message.senderName}: </strong>
                    {message.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Chat Input */}
          <div>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
