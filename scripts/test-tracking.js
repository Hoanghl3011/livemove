const { io } = require("socket.io-client");

const URL = "http://localhost:3000";
const TOKEN = process.argv[2]; // JWT Token
const ORDER_ID = process.argv[3]; // Order ID

if (!TOKEN || !ORDER_ID) {
  console.log("Usage: node test-tracking.js <TOKEN> <ORDER_ID>");
  process.exit(1);
}

const socket = io(URL, {
  auth: {
    token: TOKEN,
  },
});

socket.on("connect", () => {
  console.log("Connected to server");

  // Subscribe to tracking to see our own updates (as if we were the customer)
  socket.emit("tracking:subscribe", { orderId: ORDER_ID });

  // Simulate movement from HCMC District 1 to District 3
  const points = [
    { lat: 10.7769, lng: 106.7009 },
    { lat: 10.7780, lng: 106.6980 },
    { lat: 10.7800, lng: 106.6950 },
    { lat: 10.7820, lng: 106.6920 },
    { lat: 10.7850, lng: 106.6880 },
  ];

  let i = 0;
  const interval = setInterval(() => {
    if (i >= points.length) {
      clearInterval(interval);
      console.log("Finished simulation");
      return;
    }

    const point = points[i];
    console.log(`Sending location: ${point.lat}, ${point.lng}`);
    socket.emit("driver:location", {
      orderId: ORDER_ID,
      lat: point.lat,
      lng: point.lng,
      speed: 30,
    });

    i++;
  }, 3000);
});

socket.on("tracking:update", (data) => {
  console.log("Received tracking update:", data);
});

socket.on("connect_error", (err) => {
  console.error("Connection error:", err.message);
});
