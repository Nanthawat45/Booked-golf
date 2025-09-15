import Booking from "../models/Booking.js";
import Item from "../models/Item.js";

export const createBooking = async (req, res) => {
     const { 
      courseType, 
      date, 
      timeSlot, 
      players, 
      groupName, 
      caddy, 
      totalPrice, 
      golfCar = 0, 
      golfBag = 0,   
    } = req.body;
    try {
    //     if(golfCar > 0){
    //         golfCarItems = await Item.find({ 
    //             type: 'golfCar', 
    //             status: 'available' 
    //         }).limit(golfCar);
    //     if(golfCarItems.length < golfCar){
    //         return res.status(400).json({ message: "Not enough available golf cars" });//รถกอล์ฟไม่เพียงพอ
    //     }
    //     const updateStatusGolfCar = await Item.updateMany(
    //         { _id: { $in: golfCarItems } },
    //         { $set: { status: 'booked' } }
    //     );
    // }
        const booking = new Booking({
            user: req.user._id,
            courseType,
            date,
            timeSlot,
            players,
            groupName,
            caddy, 
            totalPrice,
            isPaid: false, // ยังไม่ชำระเงิน
            golfCar,
            //updateStatusGolfCar,
            golfBag,
            status: 'Booked'
            });
        const savedBooking = await booking.save();
        res.status(201).json(savedBooking);
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({ message: "Server error" });
    }
}

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