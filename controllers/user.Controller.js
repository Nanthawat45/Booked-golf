import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

export const generateToken = (userId, res) => { 
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.cookie("jwt", token, {
    httpOnly: true, 
    secure: process.env.NODE_MODE, 
    sameSite: "Lax",
    maxAge: 24 * 60 * 60 * 1000, 
  });
};

export const registerUser = async (req, res) => {
  const{ name, phone, email, password , role} = req.body;

  try{
    const userExists = await User.findOne({email});
    if(userExists){
      return res.status(400).json({message:"User already exists"});//มีผู้ใช้อยู่แล้ว
    }
    // const admin = await User.finById(req.user.id);
    // if(!admin || admin.role !== 'admin'){
    //   return res.status(403).json({message:"Only admin can assign roles"});
    // }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      phone,
      email,
      password: hashedPassword,
      role
    });
    if(user){
      generateToken(user._id, res);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role
      });

    }else{
      res.status(400).json({message:"Invalid user data"});//ข้อมูลผู้ใช้ไม่ถูกต้อง
    }
    } catch (error){
      console.log("Error in registerUser:", error);// ข้อผิดพลาดในการลงทะเบียนผู้ใช้
    }
  };

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({email});
    if(user && (await bcrypt.compare(password, user.password))){
      generateToken(user._id, res);
      res.json({
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
      console.log("Error in loginUser:", error);
  }
};