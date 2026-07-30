const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const javaRoutes = require("./routes/javaRoutes");
const cRoutes = require("./routes/cRoutes");
const historyRoutes = require("./routes/historyRoutes");

require("dotenv").config();

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
    res.send("LexBridge Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});