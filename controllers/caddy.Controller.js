import Caddy from "../models/Caddy";
import User from "../models/User";
import Booking from "../models/Booking";

export const startRound = async(req,res)=>{
    const {bookingId} = req.params;
    const caddyId = req.user._id;

    try{
        const booking = await Booking.findById(bookingId);
        if(!booking){
            return res.status(404).json({ message: "Booking not found." });
        }
        if(booking.caddy.map(id=> id.toString()).includes(caddyId.toString)){
            return res.status(403).json({ message: "You are not assigned to this booking." });
        }
     await Caddy.updateOne(
      { caddy_id: caddyId , caddyStatus: 'booked' },
      { $set: { caddyStatus: 'onDuty' } }
    );
            
    }catch{}
}