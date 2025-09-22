import express from "express";
import {
    createHole,
    close,
    open,
    report,
    getHoles,
    getByIdHoles,
    reportHelpCar,
    resolveGoCar
} from "../controllers/hole.Controller.js";
import { protect } from "../middleware/auth.Middleware.js";

const router = express.Router();

router.post("/addhole", protect, createHole);
router.put("/close",protect ,close);
router.put("/open",protect ,open);
router.put("/report",protect ,report);
router.get("/gethole",protect, getHoles);
router.get("/gethole/:id",protect, getByIdHoles);
router.put("/help-car", protect, reportHelpCar);
router.put("/go-car", protect, resolveGoCar);
export default router;