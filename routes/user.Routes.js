import express from 'express';
import {
    registerUser,
    login
} from "../controllers/user.Controller.js";
import { protect } from '../middleware/auth.Middleware.js';

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", login);

export default router;