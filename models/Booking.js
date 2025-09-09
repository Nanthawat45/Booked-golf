import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    courseType: { type: String, enum: ["9", "18"], required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    players: { type: Number, min: 1, max: 4, required: true },
    groupName: { type: String, required: true },
    caddy: [{ 
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
        }],
    totalPrice: { type: Number, required: true },
    isPaid: { type: Boolean, //เก็บค่าประเภท จริง/เท็จ (true/false)
        default: false //ค่าเริ่มต้นเป็น false
    },
      status: { 
        type: String, 
        enum: ['Booked', 'onGoing', 'completed', 'canceled'],
        default: 'Booked', 
        required: true
    },
    golfCar: { type: Number, default: 0 }, 
    golfBag: { type: Number, default: 0 },
    // bookedGolfCartIds: [{  
    // type: mongoose.Schema.Types.ObjectId, 
    // ref: 'Item'
    //     }],
    // bookedGolfCartIds: [{  
    // type: mongoose.Schema.Types.ObjectId, 
    // ref: 'Item'
    //     }], 
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;