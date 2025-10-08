import Caddy from "../models/Caddy.js";
import Booking from "../models/Booking.js";
import { updateBookingStatus  } from "./booking.Controller.js"
import { updateItemStatus } from "./item.controller.js";
import { startOfDay, endOfDay } from 'date-fns';

export const startRound = async (req, res) => {
  const { bookingId } = req.params;
  const caddyId = req.user._id;

  try {
    const booking = await Booking.findById(bookingId);

    // 1. ตรวจสอบ: การจองมีอยู่จริงหรือไม่
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    // 2. ตรวจสอบ: แคดดี้ที่ล็อกอินอยู่ได้รับมอบหมายให้กับการจองนี้หรือไม่
    if (booking.caddy && !booking.caddy.map(id => id.toString()).includes(caddyId.toString())) {
      return res.status(403).json({ message: "You are not assigned to this booking." });
    }

    // 3. เปลี่ยนสถานะของ Golf Carts และ Golf Bags จาก 'booked' เป็น 'inUse'
    const bookedAssetIds = [...(booking.bookedGolfCarIds || []), ...(booking.bookedGolfBagIds || [])];
    if (bookedAssetIds.length > 0) {
      await updateItemStatus(bookedAssetIds, 'inUse');
    }

    // 4. เปลี่ยนสถานะของแคดดี้ จาก 'booked' เป็น 'onGoing'
    await updateCaddyStatus(caddyId, 'onGoing');

    // 5. เปลี่ยนสถานะของ Booking จาก 'booked' เป็น 'onGoing'
    const updatedBooking = await updateBookingStatus(bookingId, 'onGoing');

    res.status(200).json({
      message: "Round started successfully. All assets and caddies are now in use.",
      booking: updatedBooking
    });

  } catch (error) {
    console.error("Failed to start round:", error);
    res.status(400).json({ error: error.message || "Failed to start round." });
  }
};

export const updateCaddyStatus = async (caddyId, newStatus) => {
  try {
    await Caddy.updateOne(
      { caddy_id: caddyId },
      { $set: { caddyStatus: newStatus } }
    );
  } catch (error) {
    throw new Error(`Failed to update caddy status: ${error.message}`);
  }
};
// export const updateCaddyBooking = async (caddyId, newStatus) => {
//   try {
//     await Caddy.updateMany(
//       { caddy_id: { $in: caddyId } },
//       { $set: { caddyStatus: newStatus } }
//     );
//     return caddyId; 
//   } catch (error) {
//     throw new Error(`Failed to update caddy status: ${error.message}`);
//   }
// };
export const updateCaddyBooking = async (caddyIds, newStatus) => {
  try {
    // อัปเดตเฉพาะแคดดี้ที่สถานะปัจจุบันเป็น "available" เท่านั้น
    await Caddy.updateMany(
      { _id: { $in: caddyIds }, caddyStatus: "available" }, 
      { $set: { caddyStatus: newStatus } }
    );

    return caddyIds; 
  } catch (error) {
    throw new Error(`Failed to update caddy status: ${error.message}`);
  }
};

export const endRound = async (req, res) => {
  const { bookingId } = req.params;
  const caddyId = req.user._id;

  try {
    const booking = await Booking.findById(bookingId);

    // 1. ตรวจสอบ: การจองมีอยู่จริงหรือไม่
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    // 2. ตรวจสอบ: แคดดี้ที่ล็อกอินอยู่ได้รับมอบหมายให้กับการจองนี้หรือไม่
    if (booking.caddy && !booking.caddy.map(id => id.toString()).includes(caddyId.toString())) {
      return res.status(403).json({ message: "You are not assigned to this booking." });
    }

    // 3. เปลี่ยนสถานะของ Golf Carts และ Golf Bags จาก 'booked' เป็น 'clean'
    const bookedAssetIds = [...(booking.bookedGolfCarIds || []), ...(booking.bookedGolfBagIds || [])];
    if (bookedAssetIds.length > 0) {
      await updateItemStatus(bookedAssetIds, 'clean');
    }

    // 4. เปลี่ยนสถานะของแคดดี้ จาก 'booked' เป็น 'clean'
    await updateCaddyStatus(caddyId, 'clean');

    // 5. เปลี่ยนสถานะของ Booking จาก 'booked' เป็น 'completed'
    const updatedBooking = await updateBookingStatus(bookingId, 'completed');

    res.status(200).json({
      message: "Round started successfully. All assets and caddies are now in use.",
      booking: updatedBooking
    });

  } catch (error) {
    console.error("Failed to start round:", error);
    res.status(400).json({ error: error.message || "Failed to start round." });
  }
};

export const markCaddyAsAvailable = async (req, res) => {
  const { bookingId } = req.params;
  const caddyId = req.user._id;

  try {
    const booking = await Booking.findById(bookingId);

    // 1. ตรวจสอบ: การจองมีอยู่จริงหรือไม่
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    // 2. ตรวจสอบ: แคดดี้ที่ล็อกอินอยู่ได้รับมอบหมายให้กับการจองนี้หรือไม่
    if (booking.caddy && !booking.caddy.map(id => id.toString()).includes(caddyId.toString())) {
      return res.status(403).json({ message: "You are not assigned to this booking." });
    }

    // 3. เปลี่ยนสถานะของ Golf Carts และ Golf Bags จาก 'booked' เป็น 'available'
    const bookedAssetIds = [...(booking.bookedGolfCarIds || []), ...(booking.bookedGolfBagIds || [])];
    if (bookedAssetIds.length > 0) {
      await updateItemStatus(bookedAssetIds, 'available');
    }

  //   const today = new Date();
  //   today.setHours(0, 0, 0, 0);

  //   const futureBooking = await Booking.findOne({
  //   caddy: caddyId,
  //   date: { $gte: today },   // ตรวจสอบทุก booking ตั้งแต่วันนี้ขึ้นไป
  //   status: 'booked'
  // });

  //   const newStatus = futureBooking ? 'booked' : 'available';

    // เรียกใช้ฟังก์ชั่น updateCaddyStatus
    //const updatedCaddy = await updateCaddyStatus(caddyId, newStatus);
    const updatedCaddy = await updateCaddyStatus(caddyId, 'available');

    res.status(200).json({
      message: "Caddy and related assets are now available.",
      caddy: updatedCaddy,
    });

  } catch (error) {
    console.error("Failed to start round:", error);
    res.status(400).json({ error: error.message || "Failed to start round." });
  }
};

export const cancelStart = async (req, res) => {
  const { bookingId } = req.params;
  const caddyId = req.user._id;

  try {
    const booking = await Booking.findById(bookingId);

    // 1. ตรวจสอบ: การจองมีอยู่จริงหรือไม่
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    // 2. ตรวจสอบ: แคดดี้ที่ล็อกอินอยู่ได้รับมอบหมายให้กับการจองนี้หรือไม่
    if (booking.caddy && !booking.caddy.map(id => id.toString()).includes(caddyId.toString())) {
      return res.status(403).json({ message: "You are not assigned to this booking." });
    }

    // 3. เปลี่ยนสถานะของ Golf Carts และ Golf Bags จาก 'booked' เป็น 'available'
    const bookedAssetIds = [...(booking.bookedGolfCarIds || []), ...(booking.bookedGolfBagIds || [])];
    if (bookedAssetIds.length > 0) {
      await updateItemStatus(bookedAssetIds, 'available');
    }

    // 4. เปลี่ยนสถานะของแคดดี้ จาก 'booked' เป็น 'available'
    await updateCaddyStatus(caddyId, 'available');

    // 5. เปลี่ยนสถานะของ Booking จาก 'booked' เป็น 'canceled'
    const updatedBooking = await updateBookingStatus(bookingId, 'canceled');

    res.status(200).json({
      message: "Round canceled successfully. All assets and caddies are now available.",
      booking: updatedBooking
    });

  } catch (error) {
    console.error("Failed to start round:", error);
    res.status(400).json({ error: error.message || "Failed to start round." });
  }
};

export const cancelDuringRound = async (req, res) => {
  const { bookingId } = req.params;
  const caddyId = req.user._id;

  try {
    const booking = await Booking.findById(bookingId);

    // 1. ตรวจสอบ: การจองมีอยู่จริงหรือไม่
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    // 2. ตรวจสอบ: แคดดี้ที่ล็อกอินอยู่ได้รับมอบหมายให้กับการจองนี้หรือไม่
    if (booking.caddy && !booking.caddy.map(id => id.toString()).includes(caddyId.toString())) {
      return res.status(403).json({ message: "You are not assigned to this booking." });
    }

    // 3. เปลี่ยนสถานะของ Golf Carts และ Golf Bags จาก 'booked' เป็น 'clean'
    const bookedAssetIds = [...(booking.bookedGolfCarIds || []), ...(booking.bookedGolfBagIds || [])];
    if (bookedAssetIds.length > 0) {
      await updateItemStatus(bookedAssetIds, 'clean');
    }

    // 4. เปลี่ยนสถานะของแคดดี้ จาก 'booked' เป็น 'clean'
    await updateCaddyStatus(caddyId, 'clean');

    // 5. เปลี่ยนสถานะของ Booking จาก 'booked' เป็น 'canceled'
     const updatedBooking = await updateBookingStatus(bookingId, 'canceled');

    res.status(200).json({
      message: "Round canceled successfully. All assets and caddies are now available.",
      booking: updatedBooking
    });

  } catch (error) {
    console.error("Failed to start round:", error);
    res.status(400).json({ error: error.message || "Failed to start round." });
  }
};

export const getCaddyAvailable = async (req, res) => {
  try {
    // เวลาปัจจุบันของไทย
    const now = new Date();
    const thailandOffset = 7 * 60; // UTC+7

    // สร้างช่วงเวลา "เริ่มต้น" และ "สิ้นสุด" ของวัน (ตามเวลาไทย)
    const startOfTodayTH = startOfDay(now);
    const endOfTodayTH = endOfDay(now);

    // แปลงช่วงเวลาไทย -> UTC (MongoDB เก็บเป็น UTC)
    const startUTC = new Date(startOfTodayTH.getTime() - thailandOffset * 60000);
    const endUTC = new Date(endOfTodayTH.getTime() - thailandOffset * 60000);

    console.log("🇹🇭 Thai Time Now:", now);
    console.log("Start of Today (TH):", startOfTodayTH);
    console.log("End of Today (TH):", endOfTodayTH);
    console.log("Start (UTC for Mongo):", startUTC);
    console.log("End (UTC for Mongo):", endUTC);

    // ดึง booking ที่จองภายในวันนี้ (เวลาตรงกับไทย)
    const bookedBookings = await Booking.find({
      date: { $gte: startUTC, $lte: endUTC },
      status: { $in: ["pending", "booked", "onGoing"] } // ถ้ายังไม่จบ
    });

    // ดึง id ของแคดดี้ที่ถูกจองแล้ว
    const bookedCaddyIds = bookedBookings.flatMap(b =>
      b.caddy.map(id => id.toString())
    );

    console.log("Caddy ที่ถูกจองวันนี้:", bookedCaddyIds);

    // ดึงเฉพาะแคดดี้ที่ยังไม่ถูกจอง
    const availableCaddies = await Caddy.find({
      _id: { $nin: bookedCaddyIds }
    });

    res.status(200).json(availableCaddies);
  } catch (error) {
    console.error("❌ Failed to get available caddies:", error);
    res.status(400).json({
      error: error.message || "Failed to get available caddies."
    });
  }
};

export const getCaddyBooking = async (req, res) => {
    const caddyId = req.user._id; // ID ของแคดดี้ที่ล็อกอินอยู่

    try {
        const bookings = await Booking.find({ // ค้นหา Booking ที่มีแคดดี้คนนี้ถูกมอบหมาย
            caddy: caddyId, //caddy ต้องตรงกับ caddyId ที่ล็อกอินอยู่
        })
        .select('courseType date timeSlot groupName') // เลือกเฉพาะ field ที่ต้องการ
        .sort({ date: 1, timeSlot: 1 }); // เรียงตามวันที่และเวลา //.sort การเรียงลำดับ
        // 1 คือ เรียงจากน้อยไปมาก (Ascending) -1 คือ เรียงจากมากไปน้อย (Descending)
        // แล้วถ้าวันที่เหมือนกัน ก็จะเรียงตาม เวลาที่จอง
        if (!bookings || bookings.length === 0) { 
            return res.status(404).json({ message: "No assigned bookings found." }); 
            // ถ้าไม่พบการจองที่แคดดี้ถูกมอบหมาย ให้ส่งข้อความว่าไม่พบการจอง
        }
        res.status(200).json(bookings); // ส่งข้อมูลการจองที่แคดดี้ถูกมอบหมายกลับไปยังผู้ใช้

    } catch (error) {
        res.status(500).json({ error: error.message || "Failed to fetch assigned bookings." });
        // ไม่สามารถรับการจองที่ ถูกมอบหมายได้
        // ส่งข้อความแสดงข้อผิดพลาดกลับไปยังผู้ใช้
    }
};