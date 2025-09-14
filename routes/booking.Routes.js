import express from 'express';
import {
    createBooking,
    getBookings,
    updateBooking,
    deleteBooking,
    getByIdBookings
} from "../controllers/booking.Controller.js";
import { protect } from '../middleware/auth.Middleware.js';

const router = express.Router();

router.post("/book",protect, createBooking);
router.get("/getbook", getBookings);
router.put("/:id", updateBooking);
//router.patch("/:id", PATCHBooking);
router.delete("/:id", deleteBooking);
router.get("/getbyidbooked", getByIdBookings);
export default router;