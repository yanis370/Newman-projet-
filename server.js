const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res)=> {
  res.send("this is our server")  
  
})

app.listen(process.env.PORT, () =>
  console.log(`🚀 Serveur sur le port ${process.env.PORT}`)
);
