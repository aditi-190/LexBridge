const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const javaRoutes = require("./routes/javaRoutes");
const cRoutes = require("./routes/cRoutes");
const historyRoutes = require("./routes/historyRoutes");

require("dotenv").config();

// Log uncaught exceptions and unhandled rejections so we can see full stacks
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err && err.stack ? err.stack : err);
});
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason && reason.stack ? reason.stack : reason);
});

const app = express();

app.use(cors());
app.use(express.json());

console.log("Node Version:", process.version);
console.log("Mongo URI:", process.env.MONGODB_URI);

connectDB();

app.use("/api/java", javaRoutes);
app.use("/api/c", cRoutes);
app.use("/api/history", historyRoutes);

app.get("/", (req, res) => {
    res.json({ message: "LexBridge backend is running" });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";
app.listen(PORT, HOST, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Error handling middleware (logs stack and returns JSON)
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err && err.stack ? err.stack : err);
    res.status(500).json({ success: false, error: err && err.message ? err.message : 'Internal Server Error' });
});