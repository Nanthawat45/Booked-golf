import mongoose from "mongoose";

const holeSchema = new mongoose.Schema({
    holeNumber: { 
        type: Number, 
        required: true, 
        unique: true,
        min: 1, max: 18
    },
    // holeType: { 
    //     type: String, 
    //     enum: [
    //         "open",
    //         "close", 
    //         "editing", 
    //         "editing_success",
    //         "help_car",
    //         "go_help_car"
    //     ]
    // },
    description: { type: String },
    status:{
        type: String,
        enum: ["open", "close", "editing", "help_car", "go_help_car"],
        default: "open",
    },
    reportedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    resolvedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    // editedBy:{
    //     type: String,
    // }
}, { timestamps: true });
const Hole = mongoose.model("Hole", holeSchema);
export default Hole;