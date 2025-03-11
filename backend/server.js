import express, { urlencoded } from 'express';
import { connect } from "mongoose";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import authRoutes from "./routes/auth.js";
import dashRoutes from "./routes/dashboard.routes.js"
import mailRoutes from './routes/mail.routes.js'

config();
const app = express();

app.use(cookieParser());
app.use(cors({
   origin: "http://localhost:3000",
   credentials: true,
}));
app.use(express.json());
app.use(urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashRoutes);
app.use("/api/mail", mailRoutes)

app.get("/", (req, res) => {
   res.send("Backend is running.....Jay Shree Ram.....")
});

const PORT = process.env.PORT || 5000;
app.use((err, req, res, next) => {

   res.setHeader("Content-Type", "application/json");

   res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Internal Server Error",
      errors: err.errors || [],
   });
});

app.listen(PORT, () =>
   console.log(`Server running on port ${PORT}`)
)

connect(process.env.MONGO_URI).then(() => {
   console.log("MongoDB Connected");
}
)
   .catch(err => console.log(err));

