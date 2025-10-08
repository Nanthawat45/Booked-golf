import express from "express";
import { createPaymentIntent, handleWebhook, getBookingBySession } from "../controllers/stripe.controller.js";
import { protect } from "../middleware/auth.Middleware.js";

const router = express.Router();

// สร้าง PaymentIntent (สำหรับ user ปกติ)
router.post("/create-payment-intent", protect, createPaymentIntent);

// Stripe Webhook (สำคัญ! ต้อง express.raw สำหรับ signature verification)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }), 
  handleWebhook
); //stripe listen --forward-to localhost:5000/api/stripe/webhook

// ดึง booking ด้วย sessionId (Step5)
router.get("/by-session/:sessionId", getBookingBySession);

export default router;
