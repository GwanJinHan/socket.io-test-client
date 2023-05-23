import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:8080"); // 서버 주소에 맞게 변경해야 합니다.

const ChatClient = () => {
  const [roomName, setRoomName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [chatRooms, setChatRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");

  useEffect(() => {
    // 채팅방 생성 결과 처리
    socket.on("room created", ({ roomId, name }) => {
      console.log(`Room created: ${name} (${roomId})`);
      setChatRooms((prevRooms) => [...prevRooms, { roomId, name }]);
    });

    // 채팅방 목록 업데이트
    socket.on("room list", (rooms) => {
      console.log("Room list:", rooms);
      setChatRooms(rooms);
    });

    // 채팅방에 입장했을 때 이벤트 처리
    socket.on("room joined", (roomId) => {
      console.log(`Joined room: ${roomId}`);
      setRoomId(roomId);
    });

    // 채팅방에서 퇴장했을 때 이벤트 처리
    socket.on("room left", (roomId) => {
      console.log(`Left room: ${roomId}`);
      setRoomId("");
      setMessages([]);
    });

    // 새로운 메시지를 받았을 때 이벤트 처리
    socket.on("new message", (chat) => {
      console.log(`New message: ${chat.senderName} - ${chat.message}`);
      setMessages((prevMessages) => [...prevMessages, chat]);
    });

    // 초기 채팅방 목록 요청
    socket.emit("get room list");

    // 컴포넌트가 언마운트될 때 소켓 연결 해제
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleCreateRoom = () => {
    socket.emit("create room", { name: roomName });
    setRoomName("");
  };

  const handleJoinRoom = (roomId) => {
    socket.emit("join room", roomId);
    setRoomId(roomId);
    setMessages([]);
  };

  const handleLeaveRoom = () => {
    socket.emit("leave room", roomId);
    setRoomId("");
    setMessages([]);
  };

  const handleSendMessage = () => {
    const chat = {
      roomId,
      senderName: "Your Name",
      message: inputMessage,
    };
    socket.emit("send message", chat);
    setInputMessage("");
  };

  return (
    <div>
      {/* 채팅방 생성 */}
      <input
        type="text"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
      />
      <button onClick={handleCreateRoom}>Create Room</button>

      {/* 채팅방 목록 */}
      <ul>
        {chatRooms.map((room) => (
          <li key={room.roomId} onClick={() => handleJoinRoom(room.roomId)}>
            {room.name}
          </li>
        ))}
      </ul>

      {/* 채팅방 */}
      {roomId && (
        <div>
          {/* 채팅 메시지 */}
          <ul>
            {messages.map((chat, index) => (
              <li key={index}>
                {chat.senderName}: {chat.message}
              </li>
            ))}
          </ul>

          {/* 메시지 입력 */}
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
          />
          <button onClick={handleSendMessage}>Send</button>

          {/* 채팅방 퇴장 */}
          <button onClick={handleLeaveRoom}>Leave Room</button>
        </div>
      )}
    </div>
  );
};

export default ChatClient;
