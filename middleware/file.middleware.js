import multer from"multer";
import path  from"path";

import firebaseConfig from "../config/Firebase.js";
// console.log(firebaseConfig);
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
}  from "firebase/storage";
import { initializeApp }  from"firebase/app";

const app = initializeApp(firebaseConfig);
const firebaseStorage = getStorage(app);

// set storage engine
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// init upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fieldSize: 1000000 }, // limit 1Mb
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb); // check file existed
  },
}).single("file"); // input name

function checkFileType(file, cb) {
  const fileTypes = /jpeg||jpg||png||gif||webp/;
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimeType);

  if (mimeType && extName) {
    return cb(null, true);
  } else {
    cb("Error: Image Only!");
  }
}

// Upload file to Firebase Storage
async function uploadToFirebase(req, res, next) {
  if (!req.file) {
    // return res.status(400).json({ message: "Image is required!" });
    next();
    // return;
  } else {
    const storageRef = ref(firebaseStorage, `uploads/${req.file.originalname}`);

    const metadata = {
      contentType: req.file.mimetype,
    };

    try {
      // uploading
      const snapshot = await uploadBytesResumable(
        storageRef,
        req.file.buffer,
        metadata
      );
      req.file.firebaseUrl = await getDownloadURL(snapshot.ref);
      console.log(req.file.firebaseUrl);
      next();
      // return;
    } catch (error) {
      res.status(500).json({
        message:
          "An error occurred while uploading file to firebase!" ||
          error.message,
      });
    }
  }
}

export { upload, uploadToFirebase };