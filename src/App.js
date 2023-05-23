// App.js

import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:8080");

function App() {
  const [chatRooms, setChatRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [userName, setUserName] = useState("");
  useEffect(() => {
    // Fetch initial chatroom list
    socket.on("room list updated", (rooms) => {
      setChatRooms(rooms);
    });

    // Room created event
    socket.on("room created", (room) => {
      setChatRooms((prevRooms) => [...prevRooms, room]);
      setCurrentRoom(room);
      setMessages([]);
    });

    // Room joined event
    socket.on("room joined", (room) => {
      setCurrentRoom(room);
      setMessages(room.messages);
    });

    // Room left event
    socket.on("room left", () => {
      setCurrentRoom(null);
      setMessages([]);
    });

    // New message event
    socket.on("new message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("room list updated");
      socket.off("room created");
      socket.off("room joined");
      socket.off("room left");
      socket.off("new message");
    };
  }, []);

  const handleUserName = () => {
    const userName = prompt("Enter Your Name: ");
    setUserName(userName);
  };

  const handleCreateRoom = () => {
    const roomName = prompt("Enter chatroom name:");
    if (roomName) {
      socket.emit("create room", roomName);
    }
  };

  const handleJoinRoom = (roomId) => {
    socket.emit("join room", roomId);
  };

  const handleLeaveRoom = () => {
    socket.emit("leave room", currentRoom.roomId);
  };

  const handleSendMessage = () => {
    if (inputMessage) {
      const messageData = {
        roomId: currentRoom.roomId,
        senderName: userName,
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
        {userName === "" ? (
          <button onClick={handleUserName}>Set User Name</button>
        ) : (
          <h2>Hello! {userName}</h2>
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
                <button onClick={() => handleJoinRoom(room.roomId)}>
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
