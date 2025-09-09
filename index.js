import BookingRoute from './routes/booking.Routes.js';
import UserRoute from './routes/user.Routes.js';
import ItemRoute from './routes/item.Route.js';
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();
const DB_URL = process.env.DB_URL;

const app = express();
try {
    mongoose.connect(DB_URL);
    console.log("Connect to Mongo DB Successfully");
  } catch (error) {
    console.log("DB Connection Failed");
  }
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL, 
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE']}));

app.use("/api/booking", BookingRoute);
app.use("/api/user", UserRoute);
app.use("/api/item", ItemRoute);

app.get("/", (req, res) => {
  res.send("Backend is running PORT 5000");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{console.log(`Server running on port ${PORT}`)})