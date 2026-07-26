const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const express = require("express");
const connectDB = require("./config/db");
const javaRoutes = require("./routes/javaRoutes");
const historyRoutes = require("./routes/historyRoutes");
require("dotenv").config();

const app = express();
app.use(express.json());

console.log("Node Version:", process.version);
console.log("Mongo URI:", process.env.MONGODB_URI);
connectDB();
app.use("/api/java", javaRoutes);
app.get("/", (req, res) => {
  res.send("LexBridge Backend Running");
});

app.use("/api/history", historyRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});




