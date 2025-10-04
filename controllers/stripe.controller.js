import dotenv from "dotenv";
dotenv.config();

import Stripe from "stripe";
import Booking from "../models/Booking.js";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// สร้าง PaymentIntent / Checkout Session
export const createPaymentIntent = async (booking, userEmail) => {
  const customer = await stripe.customers.create({
    metadata: {
      bookingId: booking._id.toString(),
      userId: booking.user._id.toString(),
    },
    email: userEmail,
  });

  const line_items = [
    {
      price_data: {
        currency: "thb",
        product_data: {
          name: `Golf Booking - ${booking.courseType} holes`,
          description: `Group: ${booking.groupName}, Date: ${booking.date.toDateString()}`,
        },
        unit_amount: booking.totalPrice * 100,
      },
      quantity: 1,
    },
  ];

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card", "promptpay"],
    mode: "payment",
    customer: customer.id,
    line_items,
    success_url: `${process.env.FRONTEND_URL}/booking?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
  });

  return session.url;
};

// Webhook สำหรับอัปเดต isPaid และ status
export const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const customer = await stripe.customers.retrieve(session.customer);
    const bookingId = customer.metadata.bookingId;

    if (bookingId) {
      const updatedBooking = await Booking.findByIdAndUpdate(
        bookingId,
        { isPaid: true, status: "booked" },
        { new: true }
      );
      console.log(`Booking ${bookingId} marked as paid ✅`, updatedBooking);
    }
  } else {
    console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).send("Received");
};

// ดึง booking จาก sessionId สำหรับ Step5
export const getBookingBySession = async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    const customer = await stripe.customers.retrieve(session.customer);
    const bookingId = customer.metadata.bookingId;

    const booking = await Booking.findById(bookingId).populate("user", "name email");

    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    res.json({ success: true, booking });
  } catch (err) {
    console.error("Error fetching booking by session:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
