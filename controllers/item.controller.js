import Item from "../models/Item.js";

export const createItem = async (req, res) => {
    const {itemId, type} = req.body;
    try {
        const itemExists = await Item.findOne({itemId});
        if(itemExists){
            return res.status(400).json({message:"Item already exists"});//มีรายการอยู่แล้ว
        }
        const item = new Item({
            itemId,
            type,
            status: 'available'
        });
        const savedItem = await item.save();
        res.status(201).json(savedItem);
    } catch {
        res.status(500).json({ message: "Server error" }); //เซิร์ฟเวอร์ error
    }
}
