import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import Caddy from '../models/Caddy.js';

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_MODE === "production",
    sameSite: "Lax",
    maxAge: 24 * 60 * 60 * 1000,
  });
};

export const registerByAdmin = async (req, res) => {
  const { name, phone, email, password, role } = req.body;
  const img = req.files?.[0]?.firebaseUrl || null;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      phone,
      email,
      password: hashedPassword,
      role,
      img
    });

    if (newUser && role === "caddy") {
      await Caddy.create({
        caddy_id: newUser._id,
        name: newUser.name,
        caddyStatus: "available"
      });
    }

    generateToken(newUser._id, res);

    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      phone: newUser.phone,
      email: newUser.email,
      role: newUser.role,
      img: newUser.img
    });

  } catch (error) {
    console.error("Error in registerByAdmin:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const registerUser = async (req, res) => {
  const { name, phone, email, password, role } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      phone,
      email,
      password: hashedPassword,
      role,
    });
    if (newUser) {
      if (role === "caddy") {
        await Caddy.create({
          caddy_id: newUser._id,
          name: newUser.name,
          caddyStatus: 'available'
        });
      }
    }
    if (newUser) {
      generateToken(newUser._id, res);
      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        phone: newUser.phone,
        email: newUser.email,
        role: newUser.role,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in registerUser:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
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

export const getUserProfile = async (req, res) => {
  try {
    //    .select('-password') คือคำสั่งเพื่อไม่ให้ดึงฟิลด์ password กลับมา
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.status(200).json({
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        img: user.img,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getAllUser = async (req, res) => {
  try {
    // ค้นหาผู้ใช้ทั้งหมดและไม่รวมฟิลด์ password
    const users = await User.find({}).select('-password');

    if (users) {
      // ส่งข้อมูลผู้ใช้ทั้งหมดกลับไป
      res.status(200).json(users);
    } else {
      // กรณีไม่พบผู้ใช้ในฐานข้อมูล (ถึงแม้จะไม่น่าจะเกิดขึ้น)
      res.status(404).json({ message: "No users found" });
    }
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const logout = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0), // ตั้งค่าให้คุกกี้หมดอายุทันที
  });

  // 2. ส่ง response กลับไปให้ client
  res.status(200).json({ message: 'Logged out successfully' });
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password'); // ไม่รวม password
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};