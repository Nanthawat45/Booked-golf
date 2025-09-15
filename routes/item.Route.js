import express from "express";
import {
    createItem,
    getByIdItem,
    deleteItem,
    getItemCar,
    getItemBag
} from "../controllers/item.controller.js";
import { protect } from '../middleware/auth.Middleware.js';

const router = express.Router();

router.post("/additem",protect, createItem);
router.get("/getitemcar", getItemCar);
router.get("/getitembag", getItemBag);
router.delete("/:id", protect, deleteItem);
router.get("/getbyiditem/:id", protect, getByIdItem);

export default router;
