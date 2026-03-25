const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();

// Configure multer exactly like in the controller
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG, PNG and PDF files are allowed'));
    }
  }
});

// Test route for file upload
app.post('/test-upload', upload.fields([
  { name: 'panFile', maxCount: 1 },
  { name: 'aadhaarFile', maxCount: 1 }
]), (req, res) => {
  console.log('Files received:', req.files);
  console.log('Body received:', req.body);
  
  const panFileUrl = req.files && req.files.panFile ? `/uploads/${req.files.panFile[0].filename}` : null;
  const aadhaarFileUrl = req.files && req.files.aadhaarFile ? `/uploads/${req.files.aadhaarFile[0].filename}` : null;
  
  console.log('PAN File URL:', panFileUrl);
  console.log('Aadhaar File URL:', aadhaarFileUrl);
  
  res.json({
    message: 'Files uploaded successfully',
    panFileUrl,
    aadhaarFileUrl,
    files: req.files
  });
});

app.use(cors());
app.use('/uploads', express.static('uploads'));

app.listen(3001, () => {
  console.log('Test upload server running on port 3001');
});
