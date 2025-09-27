import express from "express";
import {
    createItem,
    getByIdItem,
    deleteItem,
    getItemCar,
    getItemBag,
    getItemAllStatus
} from "../controllers/item.controller.js";
import { protect } from '../middleware/auth.Middleware.js';

const router = express.Router();

router.post("/additem",protect, createItem);
router.get("/getitemcar", getItemCar);
router.get("/getitembag", getItemBag);
router.delete("/:id", protect, deleteItem);
router.get("/getbyiditem/:id", protect, getByIdItem);
router.get("/all-status", getItemAllStatus);

export default router;
