import Hole from "../models/Hole.js";
import Booking from "../models/Booking.js";
import Item from "../models/Item.js";

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
    const { holeNumber, description, bookingId } = req.body;
    const userId = req.user._id;

    try {
        const hole = await Hole.findOne({ holeNumber: holeNumber });
        if (!hole) {
            return res.status(404).json({ message: "Hole not found." });
        }
        
        // อัปเดตสถานะของหลุมและบันทึก ID การจอง
        hole.status = "help_car";
        hole.description = description;
        hole.reportedBy = userId;
        hole.bookingId = bookingId; // << จุดสำคัญที่เชื่อม Hole กับ Booking
        
        const updatedHole = await hole.save();
        res.status(200).json({ 
            message: "Help Car reported successfully.", 
            hole: updatedHole 
        });
    } catch (error) {
        res.status(500).json({ message: "An error occurred while reporting the Help Car." });
    }
};

// export const resolveGoCar= async (req, res) => {
//     const { holeId } = req.params;
//     const userId = req.user._id;
//     try {
//         const hole = await Hole.findById(holeId);
//         if (!hole) {
//             return res.status(404).json({ message: "Hole not found." });
//         }
//         // อัปเดตสถานะและข้อมูลผู้แก้ไข
//         hole.status = "go_help_car";
//         hole.resolvedBy = userId;
//         const updatedHole = await hole.save();
//         res.status(200).json({ 
//             message: "go car marked as resolving.", 
//             hole: updatedHole 
//         });
//     } catch (error) {
//         res.status(500).json({ message: "An error occurred while updating the go car" });
//     }
// };

export const resolveGoCar = async (req, res) => {
    // รับแค่ ID ของหลุมมาก็พอ เพราะที่เหลือจะค้นหาเอง
    const { holeNumber } = req.body;
    const userId = req.user._id; // ID ของผู้ใช้งานที่เข้าไปแก้ไข

    try {
        // 1. ค้นหา Hole ที่มีปัญหา และใช้ bookingId ที่ถูกบันทึกไว้
        const hole = await Hole.findOne({ holeNumber: holeNumber });
        if (!hole || !hole.bookingId) {
            return res.status(404).json({ message: "ไม่พบข้อมูลการแจ้งปัญหาที่เกี่ยวข้องกับหลุมนี้" });
        }

        const booking = await Booking.findById(hole.bookingId);
        if (!booking) {
            return res.status(404).json({ message: "ไม่พบข้อมูลการจอง" });
        }

        // 2. ค้นหา 'รถคันเก่า' ที่กำลังถูกใช้งานอยู่ (inUse) จากข้อมูลการจอง
        const oldGolfCar = await Item.findOne({ 
            _id: { $in: booking.bookedGolfCarIds }, 
            status: 'inUse' 
        });
        if (!oldGolfCar) {
            return res.status(404).json({ message: "ไม่พบรถกอล์ฟที่กำลังใช้งานอยู่ในการจองนี้" });
        }
        
        // 3. ค้นหา 'รถสำรอง' ที่มีสถานะเป็น 'spare'
        const newGolfCar = await Item.findOne({ status: 'spare' });
        if (!newGolfCar) {
            return res.status(404).json({ message: "ไม่พบรถกอล์ฟสำรองที่พร้อมใช้งาน" });
        }

        // 4. อัปเดตสถานะของรถกอล์ฟ
        oldGolfCar.status = 'broken';
        await oldGolfCar.save();

        newGolfCar.status = 'inUse';
        await newGolfCar.save();

        // 5. อัปเดตข้อมูลการจอง (Booking) เพื่อเปลี่ยนรถ
        booking.bookedGolfCarIds = booking.bookedGolfCarIds.filter(id => id.toString() !== oldGolfCar._id.toString());
        booking.bookedGolfCarIds.push(newGolfCar._id);
        await booking.save();
        
        // 6. อัปเดตสถานะของ Hole และบันทึกผู้แก้ไข
        hole.status = "go_help_car";
        hole.resolvedBy = userId;
        const updatedHole = await hole.save();
        
        res.status(200).json({ 
            message: "การแก้ไขปัญหารถกอล์ฟสำเร็จ และสถานะทั้งหมดได้รับการอัปเดตแล้ว", 
            hole: updatedHole
        });
        
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการแก้ไขปัญหา:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดขณะดำเนินการ" });
    }
};