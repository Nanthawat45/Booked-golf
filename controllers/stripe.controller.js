import Stripe from "stripe";
import Booking from '../models/Booking.js';
import "dotenv/config";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// สร้าง Payment Intent
export const createPaymentIntent = async (req, res) => {
  const { bookingId, amount } = req.body;
  if (!bookingId || !amount) return res.status(400).json({ message: "Booking ID and amount are required." });

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'thb',
      metadata: { bookingId },
      description: `Payment for booking ID: ${bookingId}`
    });
    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error creating payment intent." });
  }
};

// จัดการ Webhook
export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error(`⚠️ Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("Received Stripe event:", event.type);

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      const bookingId = paymentIntent.metadata.bookingId;

      try {
        await Booking.findByIdAndUpdate(bookingId, {
          isPaid: true,
          status: 'booked',
        });
        console.log(`Payment successful and booking ID: ${bookingId} updated.`);
      } catch (dbError) {
        console.error("Error updating booking status:", dbError);
        return res.status(500).send("Database update failed.");
      }
      break;
    }
    case 'payment_intent.payment_failed': {
      const failedPaymentIntent = event.data.object;
      console.log(`Payment failed for intent ID: ${failedPaymentIntent.id}`);
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).send("Received");
};
