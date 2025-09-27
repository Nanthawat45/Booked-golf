import express from 'express';
import {
    registerUser,
    registerByAdmin,
    login,
    getUserProfile,
    getAllUser,
    logout,
    getUserById
} from "../controllers/user.Controller.js";
import { protect } from '../middleware/auth.Middleware.js';
import { upload, uploadToFirebase } from "../middleware/file.middleware.js";

const router = express.Router();

router.post("/admin/register", protect, upload, uploadToFirebase, registerByAdmin);
router.post("/register", registerUser);
router.post("/login", login);
router.get("/profile", protect, getUserProfile);
router.get("/all", protect, getAllUser);
router.post("/logout", protect, logout);
router.get("/getbyiduser/:id", protect, getUserById);

export default router;