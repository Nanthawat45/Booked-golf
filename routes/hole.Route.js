import express from "express";
import {
    createHole,
    close
} from "../controllers/hole.Controller.js";
import { protect } from "../middleware/auth.Middleware.js";

const router = express.Router();

router.post("/addhole", protect, createHole);
router.put("/close",protect ,close)

export default router;