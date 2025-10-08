import Booking from "../models/Booking.js";
import { checkItem } from "./item.controller.js";
import {updateCaddyBooking} from "./caddy.Controller.js";
import { createPaymentIntent } from "./stripe.controller.js";
import { startOfDay, endOfDay, addHours } from "date-fns"

export const createBooking = async (req, res) => {
  try {
    const {
      courseType, date, timeSlot, players, groupName, caddy,
      totalPrice, golfCar = 0, golfBag = 0
    } = req.body;

    // ตรวจสอบ availability
    let golfBagId = [];
    let golfCarId = [];
    if (golfBag > 0) golfBagId = await checkItem(golfBag, "golfBag");
    if (golfBagId.length < golfBag) return res.status(400).json({ message: "Not enough golf Bag available." });

    if (golfCar > 0) golfCarId = await checkItem(golfCar, "golfCar");
    if (golfCarId.length < golfCar) return res.status(400).json({ message: "Not enough golf cars available." });

    // ตรวจสอบ caddy
    const caddyArray = Array.isArray(caddy) ? caddy : [caddy];
    for (const caddyId of caddyArray) {
      const overlap = await Booking.findOne({ caddy: caddyId, date: new Date(date) });
      if (overlap) return res.status(400).json({ message: `Caddy ${caddyId} is already booked.` });
    }
    const caddyBooked = await updateCaddyBooking(caddyArray, "booked");

    // สร้าง booking
    const booking = new Booking({
      user: req.user._id,
      courseType, date, timeSlot, players, groupName,
      caddy: caddyBooked, totalPrice, isPaid: false,
      golfCar, golfBag, bookedGolfCarIds: golfCarId,
      bookedGolfBagIds: golfBagId, status: "pending"
    });

    const savedBooking = await booking.save();

    // สร้าง Stripe session
    const paymentUrl = await createPaymentIntent(savedBooking, req.user.email);

    res.status(201).json({ success: true, booking: savedBooking, paymentUrl });
  } catch (error) {
    console.error("Error creating booking with payment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getBookings = async (req, res) => {
    try{
        const bookings = await Booking.find()
        .populate('user', 'name email')
        // .populate('bookedGolfCartIds', 'name')
        // .populate('bookedGolfBagIds', 'name')
        res.json(bookings);
    } catch {
        res.status(500).json({message:"Server error"});//เซิร์ฟเวอร์ error
    }
};

export const updateBooking = async (req, res) =>{
    
    try{
        const booking = await Booking.findById(req.params.id);
        if(!booking){
            return res.status(404).json({message:"Booking not found"});//ไม่พบการจอง
        }
        if(req.body.timeSlot){
            booking.timeSlot = req.body.timeSlot;
        } else {
            return res.status(400).json({message:"Invalid time slot"});//ช่วงเวลาที่ไม่ถูกต้อง
        }
        const updatedBooking = await booking.save();
        res.status(200).json ({message: "Booking updated successfully", booking: updatedBooking });
    } catch {
        res.status(500).json({message:"Server error"});//เซิร์ฟเวอร์ error
    }
}

export const deleteBooking = async (req, res) =>{
    try{
        const booking = await Booking.findById(req.params.id);
        // console.log(booking);
        if(!booking){
            return res.status(404).json({message:"Booking not found"});//ไม่พบการจอง
        }
        await booking.deleteOne();
        res.status(200).json({message:"Booking deleted successfully"});//ลบการจองสำเร็จ
    } catch {
        res.status(500).json({message:"Server error"});//เซิร์ฟเวอร์ error
    }
}

export const getByIdBookings = async (req, res) => {
    const { id } = req.params;
    try{
        const bookedById = await Booking.findById(id);
        if(!bookedById){
            return res.status(404).json({message:"Booking not found"});//ไม่พบการจอง
        }
        res.send(bookedById);
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Server error"});//เซิร์ฟเวอร์ error
    }
};

export const updateBookingStatus = async (bookingId, newStatus) => {
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: newStatus },
      { new: true }
    );
    if (!updatedBooking) {
      throw new Error("Booking not found.");
    }
    return updatedBooking;
  } catch (error) {
    throw new Error(`Failed to update booking status: ${error.message}`);
  }
};

// GET Booking by ID (ข้อมูลใน Booking เท่านั้น)
export const getById_BookingUser = async (req, res) => {
    const user = req.user._id; // ID ของแคดดี้ที่ล็อกอินอยู่

    try {
        const bookings = await Booking.find({ user })
        
        .sort({ date: 1, timeSlot: 1 });
        if (!bookings || bookings.length === 0) { 
            return res.status(404).json({ message: "No assigned bookings found." }); 
        }
        res.status(200).json(bookings); 

    } catch (error) {
        res.status(500).json({ error: error.message || "Failed to fetch assigned bookings." });
    }
};

export const getBookingToday = async (req, res) => {
  try {
    const { date } = req.query;

    // ใช้วันจาก query หรือวันปัจจุบัน
    const selectedDate = date ? new Date(date) : new Date();

    // ⚙️ ปรับให้ตรงกับเวลาไทย (UTC+7)
    // แปลงวันที่ที่เลือกจากไทย -> UTC
    const startOfSelectedDay = addHours(startOfDay(selectedDate), -7);
    const endOfSelectedDay = addHours(endOfDay(selectedDate), -7);

    // console.log("🇹🇭 Thai date:", selectedDate);
    // console.log("🕐 UTC range:", startOfSelectedDay, "→", endOfSelectedDay);

    // 🔍 ค้นหาการจองภายในวันนั้น (ตามเวลาไทย)
    const bookings = await Booking.find({
      date: { $gte: startOfSelectedDay, $lte: endOfSelectedDay },
    })
      .populate("user", "name email phone")
      .populate("caddy", "name")
      .sort({ date: 1 });

    // 🧭 แปลงเวลาที่แสดงกลับเป็นเวลาไทย (เพื่อความเข้าใจง่าย)
    const bookingsWithThaiTime = bookings.map((b) => ({
      ...b.toObject(),
      date_thai: addHours(b.date, 7), // เพิ่ม 7 ชั่วโมง เพื่อแสดงตามเวลาไทย
    }));

    res.status(200).json({
      success: true,
      date: date || "today",
      count: bookingsWithThaiTime.length,
      bookings: bookingsWithThaiTime,
    });
  } catch (error) {
    console.error("❌ Failed to get bookings by date:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch bookings",
    });
  }
};