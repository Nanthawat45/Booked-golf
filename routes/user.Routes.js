import express from 'express';
import {
    registerUser,
    login
} from "../controllers/user.Controller.js";
import { protect } from '../middleware/auth.Middleware.js';
import { upload, uploadToFirebase } from "../middleware/file.middleware.js";

const router = express.Router();

router.post("/register", protect, upload, uploadToFirebase, registerUser);
router.post("/login", login);

export default router;