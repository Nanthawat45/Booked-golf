import mongoose from "mongoose";

const caddySchema = new mongoose.Schema({
    // name:{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User',
    //     required: true,
    //     unique: true, 
    // }
        caddyStatus: {
        type: String,
        enum: ['available', 'booked', 'onDuty', 'clean', 'resting', 'unavailable'],
        default: 'available',
    },
})

const Caddy = mongoose.model("Caddy", caddySchema);
export default Caddy;