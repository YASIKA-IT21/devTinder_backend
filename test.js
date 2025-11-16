const { io } = require("socket.io-client");

const socket = io("http://localhost:3000", { withCredentials: true });

socket.on("connect", () => {
  console.log("✅ Connected as:", socket.id);

  // 1️⃣ Join your own room
  socket.emit("join", "testUser123");
  console.log("➡️ Joined testUser123 room");

  // 2️⃣ Wait before sending message (to ensure join completes)
  setTimeout(() => {
    socket.emit("sendMessage", {
      sender: "testUser123",
      receiver: "otherUser456",
      text: "Hello from Node test!",
    });
    console.log("➡️ Sent message to otherUser456");
  }, 500);
});

// 3️⃣ Listen for incoming messages
socket.on("receiveMessage", (msg) => {
  console.log("📩 Received message:", msg);
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected");
});
