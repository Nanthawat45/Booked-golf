import express from 'express';
import {
    registerUser,
    registerByAdmin,
    login,
    getUserProfile,
    getAllUser,
    logout
} from "../controllers/user.Controller.js";
import { protect } from '../middleware/auth.Middleware.js';
import { upload, uploadToFirebase } from "../middleware/file.middleware.js";

const router = express.Router();

router.post("/register-by-admin", protect, upload, uploadToFirebase, registerByAdmin);
router.post("/register", registerUser);
router.post("/login", login);
router.get("/profile", protect, getUserProfile);
router.get("/all", protect, getAllUser);
router.post("/logout", protect, logout);

export default router;