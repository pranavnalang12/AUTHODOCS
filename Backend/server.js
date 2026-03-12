// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const http = require("http");
// const path = require("path");
// require("dotenv").config();

// const app = express();
// const server = http.createServer(app);

// // ===== Middleware =====
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // ===== MongoDB Connection =====
// mongoose
//   .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/authodocs", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("✅ MongoDB Connected"))
//   .catch((err) => console.error("❌ MongoDB Error:", err));

// // ===== Serve Uploads =====
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // ===== Serve Frontend =====
// const frontendPath = path.join(__dirname, "../Frontend"); // adjust if Frontend folder location is different
// app.use(express.static(frontendPath));

// // Default route: serve login page
// app.get("/", (req, res) => {
//   res.sendFile(path.join(frontendPath, "login.html")); // change file name if needed
// });

// // ===== Routes =====
// const authRoutes = require("./routes/routes");
// const showRoute = require("./routes/showRoute");
// const storeDocumentRoutes = require("./routes/storedocumentRoutes");
// const requestRoutes = require("./routes/requestRoutes");
// const statsRoutes = require("./routes/statsRoutes");
// const studentRoutes = require("./routes/studentRoutes");
// const homeshowstudstatRoute = require("./routes/homeshowstudstatRoute.js");
// const homepagedataroute = require("./routes/homepagedataroute.js");

// app.use("/api/auth", homepagedataroute);
// app.use("/api/student", homeshowstudstatRoute);
// app.use("/api/students", studentRoutes);
// app.use("/api/stats", statsRoutes);
// app.use("/api/requests", requestRoutes);
// app.use("/api/auth", authRoutes);
// app.use("/api/auth", showRoute);
// app.use("/api/documents", storeDocumentRoutes);

// // ===== Socket.IO Setup =====
// const io = require("socket.io")(server, {
//   cors: { origin: "*" },
// });
// app.set("io", io);

// io.on("connection", (socket) => {
//   console.log("🔌 New client connected", socket.id);
//   socket.on("disconnect", () => {
//     console.log("🔌 Client disconnected", socket.id);
//   });
// });

// // ===== Start Server =====
// const PORT = process.env.PORT || 5001;
// server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));




// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const path = require("path");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// ===== Middleware =====
// Note: configure CORS to explicitly allow Authorization header and your frontend origins
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: [
    'http://localhost:5500', // VSCode Live Server default
    'http://127.0.0.1:5500',
    'http://localhost:3000', // React dev server (if used)
    'http://localhost:5000', // other local origins you may use
    'http://localhost:5001'  // if you open frontend from same port (optional)
  ],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  methods: ['GET','POST','PUT','DELETE','OPTIONS']
}));

// ===== MongoDB Connection =====
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/authodocs", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ===== Serve Uploads =====
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===== Serve Frontend =====
const frontendPath = path.join(__dirname, "../Frontend"); // adjust if Frontend folder location is different
app.use(express.static(frontendPath));

// Default route: serve login page
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "login.html")); // change file name if needed
});

// ===== Routes =====
const authRoutes = require("./routes/routes");
const showRoute = require("./routes/showRoute");
const storeDocumentRoutes = require("./routes/storedocumentRoutes");
const requestRoutes = require("./routes/requestRoutes");
const statsRoutes = require("./routes/statsRoutes");
const studentRoutes = require("./routes/studentRoutes");
const homeshowstudstatRoute = require("./routes/homeshowstudstatRoute.js");
const homepagedataroute = require("./routes/homepagedataroute.js");

// route mounting (order doesn't strictly matter now that CORS is configured above)
app.use("/api/auth", homepagedataroute);
app.use("/api/student", homeshowstudstatRoute);
app.use("/api/students", studentRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/auth", showRoute);
app.use("/api/documents", storeDocumentRoutes);

// ===== Socket.IO Setup =====
const io = require("socket.io")(server, {
  cors: { origin: "*" },
});
app.set("io", io);

io.on("connection", (socket) => {
  console.log("🔌 New client connected", socket.id);
  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected", socket.id);
  });
});

// ===== Start Server =====
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
