import Hole from "../models/Hole.js";

export const close = async (req, res) => {
    const { holeNumber, description } = req.body;
    const userId = req.user._id;
    try {
        if(!holeNumber || !description){
            return res.status(400).json({message:"Please provide holeNumber and description"});
            //กรุณาใส่หมายเลขหลุมและคำอธิบาย
        }
        if(holeNumber < 1 || holeNumber > 18){
            return res.status(400).json({message:"Hole number must be between 1 and 18"});
            //หมายเลขหลุมต้องอยู่ระหว่าง 1 ถึง 18
        }
        const updatedHole = await Hole.updateOne(
            {holeNumber: holeNumber},
            {
                $set: {status: "close",
            description:description,
            reportedBy: userId
        }
    })
    if (!updatedHole) {
            return res.status(404).json({ message: "Hole not found" });
        }
    } catch {
        res.status(500).json({ message: "Server error" }); //เซิร์ฟเวอร์ error
    }
}

export const createHole = async (req, res) => {
    const {holeNumber} = req.body;

    try {
        const holes = new Hole({
            holeNumber
        });
        const savedHole = await holes.save();
        res.status(201).json(savedHole);
        
    } catch {
        res.status(500).json({ message: "Server error" }); //เซิร์ฟเวอร์ error
    }
}