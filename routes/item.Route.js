import express from "express";
import {
    createItem
} from "../controllers/item.controller.js";
import { protect } from '../middleware/auth.Middleware.js';

const router = express.Router();

router.post("/additem",protect, createItem);

export default router;
