import Booking from "../models/Booking.js";

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