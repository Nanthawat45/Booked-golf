import express from "express";
import {
    createHole,
    close,
    open,
    report,
    getHoles,
    getByIdHoles
} from "../controllers/hole.Controller.js";
import { protect } from "../middleware/auth.Middleware.js";

const router = express.Router();

router.post("/addhole", protect, createHole);
router.put("/close",protect ,close);
router.put("/open",protect ,open);
router.put("/report",protect ,report);
router.get("/gethole",protect, getHoles);
router.get("/gethole/:id",protect, getByIdHoles);

export default router;