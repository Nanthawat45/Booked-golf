import express from 'express';
import {
    createBooking,
    getBookings,
    updateBooking,
    deleteBooking
} from "../controllers/booking.Controller.js";
import { protect } from '../middleware/auth.Middleware.js';

const router = express.Router();

router.post("/book",protect, createBooking);
router.get("/getBook", getBookings);
router.put("/:id", updateBooking);
router.delete("/:id", deleteBooking);

export default router;