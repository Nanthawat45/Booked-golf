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
         await Hole.updateOne(
            {holeNumber: holeNumber},
            {
                $set: {status: "close",
            description:description,
            reportedBy: userId
        }
    })
    return res.status(200).json({ message: "Hole status successfully updated to close." });
    
    } catch (error) {
        console.log(error);
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

export const open = async (req, res) => {
    const { holeNumber} = req.body;
    const userId = req.user._id;
    try {
        if(!holeNumber ){
            return res.status(400).json({message:"Please provide holeNumber and description"});
            //กรุณาใส่หมายเลขหลุมและคำอธิบาย
        }
        if(holeNumber < 1 || holeNumber > 18){
            return res.status(400).json({message:"Hole number must be between 1 and 18"});
            //หมายเลขหลุมต้องอยู่ระหว่าง 1 ถึง 18
        }
         await Hole.updateOne(
            {holeNumber: holeNumber},
            {
                $set: {status: "open",
            resolvedBy: userId,
            description: ""
        }
    })
    return res.status(200).json({ message: "Hole status successfully updated to open." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" }); //เซิร์ฟเวอร์ error
    }
}

export const report = async (req, res) => {
    const { holeNumber} = req.body;
    const userId = req.user._id;
    try {
        if(!holeNumber ){
            return res.status(400).json({message:"Please provide holeNumber and description"});
            //กรุณาใส่หมายเลขหลุมและคำอธิบาย
        }
        if(holeNumber < 1 || holeNumber > 18){
            return res.status(400).json({message:"Hole number must be between 1 and 18"});
            //หมายเลขหลุมต้องอยู่ระหว่าง 1 ถึง 18
        }
         await Hole.updateOne(
            {holeNumber: holeNumber},
            {
                $set: {status: "editing",
            resolvedBy: userId,
            description: "กำลังแก้ไข"
        }
    })
    return res.status(200).json({ message: "Hole status successfully updated to report." });
    
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" }); //เซิร์ฟเวอร์ error
    }
}

export const getHoles = async (req, res) => {
    try{
        const holes = await Hole.find()
        res.json(holes);
    } catch {
        res.status(500).json({message:"Server error"});//เซิร์ฟเวอร์ error
    }
}

export const getByIdHoles = async (req, res) => {
    const { id } = req.params;
    try{
        const holeById = await Hole.findById(id);
        if(!holeById){
            return res.status(404).json({message:"Hole not found"});//ไม่พบหลุม
        }
        res.status(200).json(holeById);
    }catch (error){
        console.log(error);
        res.status(500).json({ message: "Server error" }); //เซิร์ฟเวอร์ error
    }
}

export const reportHelpCar = async (req, res) => {
    const { holeNumber, description } = req.body;
    const userId = req.user._id; 
    try {
        // ค้นหาหลุมจาก holeNumber
        const hole = await Hole.findOne({ holeNumber: holeNumber });
        // ถ้าไม่พบหลุม ให้ส่งข้อความ error
        if (!hole) {
            return res.status(404).json({ message: "Hole not found." });
        }
        // อัปเดตสถานะของหลุม
        hole.status = "help_car";
        hole.description = description;
        hole.reportedBy = userId;
        // บันทึกการเปลี่ยนแปลง
        const updatedHole = await hole.save();
        res.status(200).json({ 
            message: "Help Car reported successfully.", 
            hole: updatedHole 
        });
    } catch (error) {
        res.status(500).json({ message: "An error occurred while reporting the Help Car." });
    }
};

export const resolveGoCar= async (req, res) => {
    const { holeId } = req.params;
    const userId = req.user._id;
    try {
        const hole = await Hole.findById(holeId);
        if (!hole) {
            return res.status(404).json({ message: "Hole not found." });
        }
        // อัปเดตสถานะและข้อมูลผู้แก้ไข
        hole.status = "go_help_car";
        hole.resolvedBy = userId;
        const updatedHole = await hole.save();
        res.status(200).json({ 
            message: "go car marked as resolving.", 
            hole: updatedHole 
        });
    } catch (error) {
        res.status(500).json({ message: "An error occurred while updating the go car" });
    }
};