import express from 'express';
import {
    createBooking,
    getBookings,
    updateBooking,
    deleteBooking,
    getByIdBookings,
    getById_BookingUser,
    getBookingToday
} from "../controllers/booking.Controller.js";
import { protect } from '../middleware/auth.Middleware.js';

const router = express.Router();

router.post("/book", protect, createBooking);
router.get("/getbook", getBookings);
router.put("/updatebooking/:id", updateBooking);
//router.patch("/:id", PATCHBooking);
router.delete("/deletebooking/:id", protect, deleteBooking);
router.get("/getbyidbooked/:id", protect, getByIdBookings);
router.get("/getbyidbookinguser", protect, getById_BookingUser);
router.get("/today", protect, getBookingToday);

export default router;