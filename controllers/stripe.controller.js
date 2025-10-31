import dotenv from "dotenv";
dotenv.config();

import Stripe from "stripe";
import Booking from "../models/Booking.js";
import { updateCaddyBooking } from "./caddy.Controller.js";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// TODO: แทนที่ด้วยฟังก์ชันเช็คว่างจริงของคุณ
async function checkAvailability({ date, timeSlot, caddy = [], golfCartQty = 0, golfBagQty = 0 }) {
  // อย่างน้อย ๆ ให้ return ok:true ไปก่อน เพื่อให้ทดสอบ flow ได้
  return { ok: true };
}

export const createCheckoutFromDetails = async (req, res) => {
  try {
    const { courseType, date, timeSlot, players, groupName, 
      caddy = [], golfCartQty = 0, golfBagQty = 0, totalPrice 
    } = req.body;

    // 1) เช็คว่างก่อน
    const avail = await checkAvailability({ date, timeSlot, caddy, golfCartQty, golfBagQty });
    if (!avail.ok) {
      return res.status(409).json({ ok: false, message: "เวลานี้ไม่ว่าง", reason: avail.reason });
    }

    // 2) ว่าง -> สร้าง checkout session (ยังไม่บันทึก DB)
const session = await stripe.checkout.sessions.create({
  mode: "payment",
  payment_method_types: ["card"], // ✅ ใช้เฉพาะบัตร
  allow_promotion_codes: false,
  customer_creation: "if_required",
  success_url: `${process.env.FRONTEND_URL}/booking?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.FRONTEND_URL}/booking?cancelled=1`,
  line_items: [{
    price_data: {
      currency: "thb",
      product_data: { name: `Booking ${courseType} holes @ ${timeSlot}` },
      unit_amount: Math.round(Number(totalPrice) * 100),
    },
    quantity: 1,
  }],
      metadata: {
        userId: req.user._id.toString(),
        courseType, date, timeSlot, players, groupName,
        caddy: JSON.stringify(caddy),
        golfCar: String(golfCartQty),
        golfBag: String(golfBagQty),
        totalPrice: String(totalPrice),
      },
    });

    return res.json({ ok: true, url: session.url });
  } catch (err) {
    console.error("createCheckoutFromDetails error:", err);
    return res.status(500).json({ ok: false, message: "Cannot create checkout session" });
  }
};

// webhook: จ่ายสำเร็จ -> ค่อยบันทึกลง DB
export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object;
    const md = s.metadata || {};
    try {
      const booking = await Booking.create({
        user: md.userId,
        courseType: md.courseType,
        date: new Date(md.date),
        timeSlot: md.timeSlot,
        players: Number(md.players || 1),
        groupName: md.groupName,
        caddy: JSON.parse(md.caddy || "[]"),
        golfCar: Number(md.golfCar || 0),
        golfBag: Number(md.golfBag || 0),
        totalPrice: Number(md.totalPrice || 0),
        isPaid: true,
        status: "booked",
        stripeSessionId: s.id,
      });
          if (caddies.length > 0) {
      await updateCaddyBooking(caddies, "booked");
    }
    
      console.log("✅ Booking created after payment:", booking._id);
    } catch (e) {
      console.error("Webhook save error:", e);
    }
  }

  res.json({ received: true });
};

export const getBookingBySession = async (req, res) => {
  const booking = await Booking.findOne({ stripeSessionId: req.params.sessionId });
  if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
  res.json({ success: true, booking });
};

// สร้าง PaymentIntent / Checkout Session
// export const createPaymentIntent = async (booking, userEmail) => {
//   const customer = await stripe.customers.create({
//     metadata: {
//       bookingId: booking._id.toString(),
//       userId: booking.user._id.toString(),
//     },
//     email: userEmail,
//   });

//   const line_items = [
//     {
//       price_data: {
//         currency: "thb",
//         product_data: {
//           name: `Golf Booking - ${booking.courseType} holes`,
//           description: `Group: ${booking.groupName}, Date: ${booking.date.toDateString()}`,
//         },
//         unit_amount: booking.totalPrice * 100,
//       },
//       quantity: 1,
//     },
//   ];

//   const session = await stripe.checkout.sessions.create({
//     payment_method_types: ["card", "promptpay"],
//     mode: "payment",
//     customer: customer.id,
//     line_items,
//     success_url: `${process.env.FRONTEND_URL}/booking?session_id={CHECKOUT_SESSION_ID}`,
//     cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
//   });

//   return session.url;
// };

// // Webhook สำหรับอัปเดต isPaid และ status
// export const handleWebhook = async (req, res) => {
//   const sig = req.headers["stripe-signature"];
//   const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

//   let event;
//   try {
//     event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//   } catch (err) {
//     console.error("Webhook signature verification failed:", err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   if (event.type === "checkout.session.completed") {
//     const session = event.data.object;

//     const customer = await stripe.customers.retrieve(session.customer);
//     const bookingId = customer.metadata.bookingId;

//     if (bookingId) {
//       const updatedBooking = await Booking.findByIdAndUpdate(
//         bookingId,
//         { isPaid: true, status: "booked" },
//         { new: true }
//       );
//       console.log(`Booking ${bookingId} marked as paid ✅`, updatedBooking);
//     }
//   } else {
//     console.log(`Unhandled event type ${event.type}`);
//   }

//   res.status(200).send("Received");
// };

// ดึง booking จาก sessionId สำหรับ Step5
// export const getBookingBySession = async (req, res) => {
//   try {
//     const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
//     const customer = await stripe.customers.retrieve(session.customer);
//     const bookingId = customer.metadata.bookingId;

//     const booking = await Booking.findById(bookingId).populate("user", "name email");

//     if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

//     res.json({ success: true, booking });
//   } catch (err) {
//     console.error("Error fetching booking by session:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };
