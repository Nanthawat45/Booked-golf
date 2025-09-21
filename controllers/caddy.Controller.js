import Caddy from "../models/Caddy.js";
import Booking from "../models/Booking.js";
import { updateBookingStatus  } from "./booking.Controller.js"
import { updateItemStatus } from "./item.controller.js";


// export const startRound = async(req,res)=>{
//     const {bookingId} = req.params;
//     const caddyId = req.user._id;

//     try{
//         // const booking = await Booking.findById(bookingId);
//         // if(!booking){
//         //     return res.status(404).json({ message: "Booking not found." });
//         // }
//         // if(booking.caddy.map(id=> id.toString()).includes(caddyId.toString)){
//         //     return res.status(403).json({ message: "You are not assigned to this booking." });
//         // }
//      await Caddy.updateOne(
//       { caddy_id: caddyId , caddyStatus: 'booked' },
//       { $set: { caddyStatus: 'onDuty' } }
//     );
            
//     }catch{
        
//     }
// }

export const updateCaddyStatus = async (caddyId, newStatus) => {
  try {
    const updatedCaddy = await Caddy.findByIdAndUpdate(
      caddyId,
      { caddyStatus: newStatus },
      { new: true, runValidators: true }
    );
    if (!updatedCaddy) {
      throw new Error('Caddy not found.');
    }
    return updatedCaddy;
  } catch (error) {
    throw new Error(`Failed to update caddy status: ${error.message}`);
  }
};

// export const startRound = async (req, res) => {
//   const caddyId = req.user._id;
//   const { newStatus, bookingId } = req.body;
//   try {
//     if (!caddyId) {
//       return res.status(400).json({ message: 'Invalid Caddy ID.' });
//     }

//   const validCaddyStatuses = ['onDuty', 'clean', 'resting', 'unavailable'];
//   if (!validCaddyStatuses.includes(newStatus)) {
//     return res.status(400).json({ message: 'Invalid status for Caddy.' });
//   }

//     // 1. ตรวจสอบว่า Caddy และ Booking สัมพันธ์กันจริงหรือไม่
//     const bookingToUpdate = await Booking.findOne({
//       _id: bookingId,
//       caddy: caddyId,
//       status: { $in: ['booked', 'onGoing'] }
//     });

//     if (!bookingToUpdate) {
//       return res.status(404).json({ message: 'Booking not found or Caddy not assigned to this booking.' });
//     }
//     // 1. อัปเดตสถานะของ Caddy
//     const updatedCaddy = await updateCaddyStatus(caddyId, newStatus);

//     // 2. ค้นหา Booking ที่เกี่ยวข้องกับแคดดี้คนนี้
//     const relatedBooking = await Booking.findOne({
//       caddy: caddyId,
//       status: { $in: ['booked', 'onGoing'] }
//     });

//     let updatedBooking = null;
//     let updatedItems = [];

//     if (relatedBooking) {
//       let bookingStatus, itemStatus;
//       if (newStatus === 'onDuty') { 
//         bookingStatus = 'onGoing';
//         itemStatus = 'inUse';
//       } else if (newStatus === 'clean' || newStatus === 'resting') {
//         bookingStatus = 'completed';
//         itemStatus = 'available';
//       }

//       // 3. อัปเดตสถานะของ Booking
//       if (bookingStatus) {
//         updatedBooking = await updateBookingStatus(relatedBooking._id, bookingStatus);
//       }

//       // 4. อัปเดตสถานะของ Item
//       const allItemIds = [...relatedBooking.golfCar, ...relatedBooking.golfBag];
//       if (allItemIds.length > 0 && itemStatus) {
//         updatedItems = await updateItemStatus(allItemIds, itemStatus);
//       }
//     }

//     res.status(200).json({
//       message: 'All statuses updated successfully.',
//       data: {
//         caddy: updatedCaddy,
//         booking: updatedBooking,
//         items: updatedItems,
//       },
//     });

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

export const startRound = async (req, res) => {
    // ใช้ req.user._id เพื่อระบุตัวตนของ Caddy ที่กำลังใช้งาน
    const caddyId = req.user._id;
    const { newStatus, bookingId } = req.body;
     console.log('Received request to update statuses:');
    console.log(`- Caddy ID: ${caddyId}`);
    console.log(`- Booking ID: ${bookingId}`);
    console.log(`- New Status: ${newStatus}`);

    if (!caddyId) {
        return res.status(401).json({ message: 'Unauthorized: Caddy ID is missing.' });
    }
    
    if (bookingId) {
        return res.status(400).json({ message: 'Invalid Booking ID.' });
    }

    const validCaddyStatuses = ['onDuty', 'clean', 'resting', 'unavailable'];
    if (!validCaddyStatuses.includes(newStatus)) {
        return res.status(400).json({ message: 'Invalid status for Caddy.' });
    }

    try {
        console.log('Searching for booking with:');
        console.log(`- _id: ${bookingId}`);
        console.log(`- caddy: ${caddyId}`);
        
        // 1. ตรวจสอบว่า Caddy และ Booking สัมพันธ์กันจริงหรือไม่ (ทำแค่ครั้งเดียว)
        const bookingToUpdate = await Booking.findOne({
            _id: bookingId,
            caddy: caddyId,
            status: { $in: ['booked', 'onGoing'] }
        });

        if (!bookingToUpdate) {
            return res.status(404).json({ message: 'Booking not found or Caddy not assigned to this booking.' });
        }

        // 2. อัปเดตสถานะของ Caddy
        const updatedCaddy = await updateCaddyStatus(caddyId, newStatus);

        let updatedBooking = null;
        let updatedItems = [];

        // 3. กำหนดสถานะของ Booking และ Item ตามสถานะใหม่ของ Caddy
        let bookingStatus, itemStatus;
        if (newStatus === 'onDuty') {
            bookingStatus = 'onGoing';
            itemStatus = 'inUse';
        } else if (newStatus === 'clean' || newStatus === 'resting') {
            bookingStatus = 'completed';
            itemStatus = 'available';
        }

        // 4. อัปเดตสถานะของ Booking
        if (bookingStatus) {
            updatedBooking = await updateBookingStatus(bookingToUpdate._id, bookingStatus);
        }

        // 5. อัปเดตสถานะของ Item
        const allItemIds = [...bookingToUpdate.golfCar, ...bookingToUpdate.golfBag];
        if (allItemIds.length > 0 && itemStatus) {
            updatedItems = await updateItemStatus(allItemIds, itemStatus);
        }

        res.status(200).json({
            message: 'All statuses updated successfully.',
            data: {
                caddy: updatedCaddy,
                booking: updatedBooking,
                items: updatedItems,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};