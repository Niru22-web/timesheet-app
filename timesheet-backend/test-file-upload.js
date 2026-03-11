const express = require('express');
const multer = require('multer');
const path = 'path';
const cors = require('cors');

const app = express();

// Configure multer exactly like in the updated controller
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Sanitize filename: remove special characters, replace spaces with underscores
    const sanitizedName = file.originalname
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    cb(null, file.fieldname + '-' + uniqueSuffix + '_' + sanitizedName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Enhanced file type validation with better error handling
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    // Special validation for employee photo (images only)
    if (file.fieldname === 'employeePhoto') {
      const imageTypes = /jpeg|jpg|png/;
      const isImage = imageTypes.test(path.extname(file.originalname).toLowerCase()) && 
                      imageTypes.test(file.mimetype);
      
      if (isImage) {
        return cb(null, true);
      } else {
        return cb(new Error('Employee photo must be a valid image file (JPG, JPEG, PNG)'));
      }
    }

    // For other files (PAN, Aadhaar, Bank Statement)
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
  { name: 'aadhaarFile', maxCount: 1 },
  { name: 'employeePhoto', maxCount: 1 },
  { name: 'bankStatementFile', maxCount: 1 }
]), (req, res) => {
  console.log('Files received:', req.files);
  console.log('Body received:', req.body);
  
  const panFileUrl = req.files && req.files.panFile ? `/uploads/${req.files.panFile[0].filename}` : null;
  const aadhaarFileUrl = req.files && req.files.aadhaarFile ? `/uploads/${req.files.aadhaarFile[0].filename}` : null;
  const employeePhotoUrl = req.files && req.files.employeePhoto ? `/uploads/${req.files.employeePhoto[0].filename}` : null;
  const bankStatementFileUrl = req.files && req.files.bankStatementFile ? `/uploads/${req.files.bankStatementFile[0].filename}` : null;
  
  console.log('PAN File URL:', panFileUrl);
  console.log('Aadhaar File URL:', aadhaarFileUrl);
  console.log('Employee Photo URL:', employeePhotoUrl);
  console.log('Bank Statement File URL:', bankStatementFileUrl);
  
  res.json({
    message: 'Files uploaded successfully',
    panFileUrl,
    aadhaarFileUrl,
    employeePhotoUrl,
    bankStatementFileUrl,
    files: req.files
  });
});

app.use(cors());
app.use('/uploads', express.static('uploads'));

app.listen(3002, () => {
  console.log('Test upload server running on port 3002');
  console.log('Test with: curl -X POST -F "employeePhoto=@test.jpg" http://localhost:3002/test-upload');
});
