import express from "express"

import {
    startRound,
    markCaddyAsAvailable,
    endRound,
    cancelDuringRound,
    cancelStart,
    getCaddyAvailable,
    getCaddyBooking
}from "../controllers/caddy.Controller.js"

import { protect } from '../middleware/auth.Middleware.js';

const router = express.Router();

router.put("/start/:bookingId", protect, startRound);
router.put("/end/:bookingId", protect, endRound);
router.put("/available/:bookingId", protect, markCaddyAsAvailable);
router.put("/cancel-start/:bookingId", protect, cancelStart);
router.put("/cancel-during-round/:bookingId", protect, cancelDuringRound);

router.post("/available-caddies", protect, getCaddyAvailable);
router.get("/caddybooking", protect, getCaddyBooking);
export default router;