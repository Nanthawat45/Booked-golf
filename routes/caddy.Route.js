import express from "express"

import {
    startRound,
    
    }from "../controllers/caddy.Controller.js"

import { protect } from '../middleware/auth.Middleware.js';

const router = express.Router();

router.put("/start", protect, startRound);

export default router;