import express from 'express';
import { createPaymentIntent, handleWebhook } from '../controllers/stripe.controller.js';

const router = express.Router();

// Route สำหรับสร้าง PaymentIntent
// Frontend จะเรียกใช้ API นี้เพื่อรับ clientSecret
router.post('/create-payment-intent', createPaymentIntent);

// Route สำหรับ Webhook
// Stripe จะเรียกใช้ API นี้โดยตรง
// **สำคัญ: ต้องใช้ express.raw() เพื่อให้ Stripe ตรวจสอบ signature ได้**
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

export default router;